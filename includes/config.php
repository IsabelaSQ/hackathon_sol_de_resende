<?php
require "config.php";
//  Fluxo principal
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['nome_equipamento'])) {

    // Criar conexao (escolha o tipo de usuario conforme necessidade)
    $pdo = Conexao::conectar('operador');

    $nomeMaquina   = $_POST['nome_equipamento'];
    $statusInicial = "Operando";

    // Inserir maquina
    $sql = "INSERT INTO tbl_maquinas (nome_equipamento, status_operacional)
            VALUES (:nome, :status)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':nome', $nomeMaquina);
    $stmt->bindParam(':status', $statusInicial);
    $stmt->execute();

    //  ID da maquina recem-criada
    $idMaquina = $pdo->lastInsertId();

    // Inserir ativo relacionado
    $dataEvento = date('Y-m-d');
    $horaEvento = date('H:i:s');
    $severidade = 'Baixa'; // Pode vir de um select no formulario

    $sqlAtivo = "INSERT INTO tbl_ativos 
                (id_maquina, data_evento, hora_evento, nivel_severidade)
                VALUES (:id_maquina, :data, :hora, :severidade)";
    $stmtAtivo = $pdo->prepare($sqlAtivo);
    $stmtAtivo->bindParam(':id_maquina', $idMaquina);
    $stmtAtivo->bindParam(':data', $dataEvento);
    $stmtAtivo->bindParam(':hora', $horaEvento);
    $stmtAtivo->bindParam(':severidade', $severidade);
    $stmtAtivo->execute();

    echo " Maquina e ativo cadastrados com sucesso!";
}
?>