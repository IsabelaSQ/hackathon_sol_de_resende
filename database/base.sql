-- ===================================================================
-- 1. CRIAÇÃO DO BANCO DE DADOS
-- ===================================================================
CREATE DATABASE IF NOT EXISTS sol_resende;
USE sol_resende;

-- ===================================================================
-- 2. CRIAÇÃO DAS TABELAS
-- ===================================================================
CREATE TABLE IF NOT EXISTS tbl_maquinas (
    id_numerico INT PRIMARY KEY AUTO_INCREMENT,
    nome_equipamento VARCHAR(100) NOT NULL,
    status_operacional ENUM('Operando', 'Falha', 'Manutenção') NOT NULL 
);

CREATE TABLE IF NOT EXISTS tbl_ativos (
    pk_ati_id INT AUTO_INCREMENT PRIMARY KEY,
    ati_nome_equipamento VARCHAR(100) NOT NULL,
    ati_data_aquisicao DATE,
    ati_valor_custo DECIMAL(10,2),
    ati_status ENUM('Operacional', 'Manutenção', 'Crítico') NOT NULL
);

CREATE TABLE IF NOT EXISTS tbl_alertas (
    pk_alerta_id INT AUTO_INCREMENT PRIMARY KEY,
    ati_id INT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ale_severidade INT CHECK (ale_severidade BETWEEN 1 AND 3)
);

-- ===================================================================
-- 3. CARGA DE DADOS INICIAIS
-- ===================================================================
INSERT INTO tbl_maquinas (nome_equipamento, status_operacional) VALUES 
('Torno Mecânico Universal', 'Operando'),
('Fresa Ferramentaria ISO 40', 'Falha'),
('Compressor de Ar Parafuso', 'Operando'),
('Furadeira de Coluna G3', 'Manutenção'),
('Retificadora Plana', 'Operando'),
('Serra de Fita Industrial', 'Falha');

-- ===================================================================
-- 4. GATILHO (TRIGGER) DE AUDITORIA
-- ===================================================================
DROP TRIGGER IF EXISTS tr_auditoria_critico;

DELIMITER //
CREATE TRIGGER tr_auditoria_critico
AFTER UPDATE ON tbl_ativos 
FOR EACH ROW
BEGIN
    IF NEW.ati_status = 'Crítico' THEN
        INSERT INTO tbl_alertas (ati_id, ale_severidade) 
        VALUES (NEW.pk_ati_id, 3); 
    END IF;
END; //
DELIMITER ;

-- ===================================================================
-- 5. VISUALIZAÇÕES (VIEWS)
-- ===================================================================
CREATE OR REPLACE VIEW vw_relatorio_operacional AS
SELECT 
    ati_nome_equipamento AS Equipamento,
    ati_status AS Status
FROM tbl_ativos;

CREATE OR REPLACE VIEW vw_painel_crises_gerencia AS
SELECT 
    a.pk_alerta_id AS Protocolo,
    e.ati_nome_equipamento AS Equipamento,
    a.data_hora AS Data_Hora_Falha,
    a.ale_severidade AS Nivel_Severidade,
    e.ati_status AS Status_Atual
FROM tbl_alertas a
JOIN tbl_ativos e ON a.ati_id = e.pk_ati_id
WHERE a.ale_severidade = 3
ORDER BY a.data_hora DESC;

-- ===================================================================
-- 6. USUÁRIOS E PERMISSÕES
-- ===================================================================
CREATE USER IF NOT EXISTS 'app_resende'@'localhost' IDENTIFIED BY 'Senha_Resende_2026';
GRANT SELECT, INSERT ON sol_resende.tbl_maquinas TO 'app_resende'@'localhost';

CREATE USER IF NOT EXISTS 'monitor'@'localhost' IDENTIFIED BY '123456';
GRANT SELECT, INSERT ON sol_resende.tbl_maquinas TO 'monitor'@'localhost';

CREATE USER IF NOT EXISTS 'gerente_fabrica'@'localhost' IDENTIFIED BY 'Gestao2026!';
GRANT SELECT ON sol_resende.vw_painel_crises_gerencia TO 'gerente_fabrica'@'localhost';

FLUSH PRIVILEGES;
