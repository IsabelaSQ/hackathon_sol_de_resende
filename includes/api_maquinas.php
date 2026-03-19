<?php
// Permite que o JavaScript consiga ler esta resposta e define o formato como JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Inclui o teu ficheiro de conexão original
require_once "conexao.php";

try {
    // Usa o utilizador 'monitor' configurado na tua classe para ter permissão de leitura
    $pdo = Conexao::conectar('monitor');

    // Vai buscar os dados à tabela que criaste no base.sql
    $stmt = $pdo->query("SELECT id_numerico, nome_equipamento, status_operacional FROM tbl_maquinas");
    $maquinas = $stmt->fetchAll();

    // Devolve as máquinas formatadas em JSON
    echo json_encode($maquinas);

} catch (Exception $e) {
    // Se der erro, devolve o erro
    echo json_encode(['erro' => 'Erro ao ligar à base de dados: ' . $e->getMessage()]);
}
?>