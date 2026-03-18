<?php
class Conexao {

    private static $host = 'localhost';
    private static $db   = 'sol_resende';
    private static $charset = 'utf8mb4';

    public static function conectar($tipoUsuario = 'monitor') {

        switch ($tipoUsuario) {
            case 'gerente':
                $user = 'gerente_fabrica';
                $pass = 'Gestao2026!';
                break;

            case 'operador':
                $user = 'app_resende';
                $pass = 'Senha_Resende_2026';
                break;

            default: // monitor
                $user = 'monitor';
                $pass = '123456';
                break;
        }

        try {
            $pdo = new PDO(
                "mysql:host=" . self::$host . ";dbname=" . self::$db . ";charset=" . self::$charset,
                $user,
                $pass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );

            return $pdo;

        } catch (PDOException $e) {
            die("Erro de conexao: " . $e->getMessage());
        }
    }
}

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