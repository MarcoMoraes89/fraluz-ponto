// controllers/relatoriosController.js
const { query } = require('../db/index');

function calcularDiferencaMinutos(inicio, fim) {
    const start = new Date(inicio).getTime();
    const end = new Date(fim).getTime();
    return Math.floor((end - start) / (1000 * 60));
}

function formatarMinutos(totalMinutos) {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas}h ${minutos}m`;
}

// Função principal que gera o relatório
exports.gerarRelatorio = async (req, res) => {
    const { codigo, dataIni, dataFim } = req.query;

    if (!codigo || !dataIni || !dataFim) {
        return res.status(400).json({ error: 'Código, Data Inicial e Data Final são obrigatórios para o relatório.' });
    }

    try {
        // 1. Buscar dados do voluntário
        const voluntarioResult = await query('SELECT nome, url_foto FROM voluntarios WHERE codigo = $1', [codigo]);
        if (voluntarioResult.rows.length === 0) {
            return res.status(404).json({ error: 'Voluntário não encontrado.' });
        }
        const voluntario = voluntarioResult.rows[0];

        // 2. Buscar todas as atividades no período
        const atividadesQuery = `
            SELECT id, nome, data_inicio, data_termino, voluntarios_elegiveis, codigo_assistido
            FROM atividades
            WHERE data_inicio >= $1 AND data_termino <= $2
            ORDER BY data_inicio ASC;
        `;
        const atividades = (await query(atividadesQuery, [dataIni, dataFim])).rows;

        // 3. Buscar todos os registros de ponto do voluntário no período
        const pontoQuery = `
            SELECT tipo, data_hora 
            FROM registro_ponto 
            WHERE codigo_voluntario = $1 
            AND data_hora >= $2 AND data_hora <= $3 
            ORDER BY data_hora ASC;
        `;
        const registrosPonto = (await query(pontoQuery, [codigo, dataIni, dataFim])).rows;

        // 4. Calcular o tempo total de presença do voluntário (entre IN/OUT)
        let totalMinutosVoluntario = 0;
        let entrada = null;

        registrosPonto.forEach(registro => {
            if (registro.tipo === 'IN') {
                entrada = registro.data_hora;
            } else if (registro.tipo === 'OUT' && entrada) {
                totalMinutosVoluntario += calcularDiferencaMinutos(entrada, registro.data_hora);
                entrada = null;
            }
        });

        // 5. Processar o detalhamento por atividade
        let detalhamentoAtividades = [];
        let totalMinutosAtividades = 0; // Soma da duração de todas as atividades no período

        atividades.forEach(atividade => {
            const elegivel = atividade.voluntarios_elegiveis && atividade.voluntarios_elegiveis.includes(codigo);
            const duracaoAtividadeMinutos = calcularDiferencaMinutos(atividade.data_inicio, atividade.data_termino);
            totalMinutosAtividades += duracaoAtividadeMinutos;

            let minutosContribuicao = 0;
            let entradaAtividade = null;

            registrosPonto.forEach(registro => {
                const registroTime = new Date(registro.data_hora).getTime();
                const inicioAtividadeTime = new Date(atividade.data_inicio).getTime();
                const fimAtividadeTime = new Date(atividade.data_termino).getTime();

                if (registroTime >= inicioAtividadeTime && registroTime <= fimAtividadeTime) {
                    if (registro.tipo === 'IN') {
                        entradaAtividade = registro.data_hora;
                    } else if (registro.tipo === 'OUT' && entradaAtividade) {
                        minutosContribuicao += calcularDiferencaMinutos(entradaAtividade, registro.data_hora);
                        entradaAtividade = null;
                    }
                }
            });

            const percentualContribuicao = duracaoAtividadeMinutos > 0
                ? ((minutosContribuicao / duracaoAtividadeMinutos) * 100).toFixed(2)
                : '0.00';

            detalhamentoAtividades.push({
                nomeAtividade: atividade.nome,
                inicio: atividade.data_inicio,
                termino: atividade.data_termino,
                duracaoTotal: formatarMinutos(duracaoAtividadeMinutos),
                tempoVoluntario: formatarMinutos(minutosContribuicao),
                percentualContribuicao: percentualContribuicao + '%',
                elegivel: elegivel ? 'Sim' : 'Não'
            });
        });

        const percentualTotalPresenca = totalMinutosAtividades > 0 
            ? ((totalMinutosVoluntario / totalMinutosAtividades) * 100).toFixed(2) 
            : '0.00';


        res.status(200).json({
            voluntario: voluntario,
            periodo: { dataIni, dataFim },
            sumario: {
                codigo: codigo,
                totalMinutosVoluntario: totalMinutosVoluntario,
                totalHorasVoluntario: formatarMinutos(totalMinutosVoluntario),
                totalMinutosAtividades: totalMinutosAtividades,
                totalHorasAtividades: formatarMinutos(totalMinutosAtividades),
                percentualTotalPresenca: percentualTotalPresenca + '%'
            },
            detalhamento: detalhamentoAtividades,
        });

    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao gerar relatório.' });
    }
};