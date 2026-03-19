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