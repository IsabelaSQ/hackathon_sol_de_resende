CREATE DATABASE sol_resende;
USE sol_resende;

CREATE TABLE tbl_maquinas (
    id_numerico INT PRIMARY KEY AUTO_INCREMENT,
    nome_equipamento VARCHAR(100) NOT NULL,
    status_operacional ENUM('Operando', 'Falha', 'Manutenção') NOT NULL 
);

INSERT INTO tbl_maquinas (nome_equipamento, status_operacional) VALUES 
('Torno Mecânico Universal', 'Operando'),
('Fresa Ferramentaria ISO 40', 'Falha'),
('Compressor de Ar Parafuso', 'Operando'),
('Furadeira de Coluna G3', 'Manutenção'),
('Retificadora Plana', 'Operando'),
('Serra de Fita Industrial', 'Falha');

-- Verificando a inserção
SELECT * FROM tbl_maquinas;

-- 1. Adicionando a coluna de severidade (nível 1 a 3)
ALTER TABLE tbl_alertas 
ADD COLUMN ale_severidade INT CHECK (ale_severidade BETWEEN 1 AND 3);

-- 2. Modificando a coluna de data para ser automática (caso ela ainda não seja)
-- Se a coluna já existir, usamos MODIFY; se for nova, usamos ADD.
ALTER TABLE tbl_alertas 
MODIFY COLUMN data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


DROP TRIGGER IF EXISTS tr_auditoria_critico;

DELIMITER //

CREATE TRIGGER tr_auditoria_critico
AFTER UPDATE ON tbl_ativos 
FOR EACH ROW
BEGIN
    -- Se o status mudar para 'Crítico', registramos como Severidade 3 (Máxima)
    IF NEW.ati_status = 'Crítico' THEN
        INSERT INTO tbl_alertas (ati_id, ale_severidade) 
        VALUES (NEW.pk_ati_id, 3); 
        -- Note que não passamos a data, o CURRENT_TIMESTAMP fará isso sozinho!
    END IF;
END; //

DELIMITER ;

-- Simulando uma falha crítica
UPDATE tbl_ativos SET ati_status = 'Crítico' WHERE pk_ati_id = 2;

-- Verificando o log com data/hora automática e severidade
SELECT * FROM tbl_alertas;



-- Criando a visão para o painel do gerente
CREATE VIEW vw_painel_crises_gerencia AS
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


-- Cria o usuário com uma senha segura
CREATE USER 'app_resende'@'localhost' IDENTIFIED BY 'Senha_Resende_2026';

-- Concede APENAS as permissões de leitura (SELECT) e inserção (INSERT)
GRANT SELECT, INSERT ON sol_resende.tbl_maquinas TO 'app_resende'@'localhost';


-- Criando o usuário do gerente (caso não exista)
CREATE USER 'gerente_fabrica'@'localhost' IDENTIFIED BY 'Gestao2026!';

-- Concedendo acesso apenas ao que ele precisa monitorar
GRANT SELECT ON vw_painel_crises_gerencia TO 'gerente_fabrica'@'localhost';

-- Aplica as novas permissões imediatamente
FLUSH PRIVILEGES;


-- MODELO ALTERNATIVO -- 

CREATE DATABASE IF NOT EXISTS sol_resende;
USE sol_resende;

-- 1. TABELA DE ATIVOS (Criação Principal)
-- Aqui resolvemos a falha: o Trigger e a View dependem desta tabela.
CREATE TABLE tbl_ativos (
    pk_ati_id INT AUTO_INCREMENT PRIMARY KEY,
    ati_nome_equipamento VARCHAR(100) NOT NULL,
    ati_data_aquisicao DATE,
    ati_valor_custo DECIMAL(10,2),
    ati_status ENUM('Operacional', 'Manutenção', 'Crítico') NOT NULL
);

-- 2. TABELA DE ALERTAS (Estrutura de Auditoria)
CREATE TABLE tbl_alertas (
    pk_alerta_id INT AUTO_INCREMENT PRIMARY KEY,
    ati_id INT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ale_severidade INT CHECK (ale_severidade BETWEEN 1 AND 3)
);

-- 3. GATILHO DE AUDITORIA (Lógica de Automação)
-- Resolvemos a falha de "Table doesn't exist" garantindo que tbl_ativos foi criada acima.
DROP TRIGGER IF EXISTS tr_auditoria_critico;
DELIMITER //
CREATE TRIGGER tr_auditoria_critico
AFTER UPDATE ON tbl_ativos
FOR EACH ROW
BEGIN
    -- Se mudar para Crítico, gera alerta severidade 3 automaticamente
    IF NEW.ati_status = 'Crítico' THEN
        INSERT INTO tbl_alertas (ati_id, ale_severidade) 
        VALUES (NEW.pk_ati_id, 3);
    END IF;
END; //
DELIMITER ;

-- 4. VIEW DE GOVERNANÇA (Blindagem de Dados Sensíveis)
-- Oculta o 'ati_valor_custo' para usuários operacionais.
CREATE OR REPLACE VIEW vw_relatorio_operacional AS
SELECT 
    ati_nome_equipamento AS Equipamento,
    ati_status AS Status
FROM tbl_ativos;

-- 5. VIEW DO GERENTE (Painel de Crises)
CREATE OR REPLACE VIEW vw_painel_crises_gerencia AS
SELECT 
    a.pk_alerta_id AS Protocolo,
    e.ati_nome_equipamento AS Equipamento,
    a.data_hora AS Data_Hora_Falha,
    a.ale_severidade AS Nivel_Severidade
FROM tbl_alertas a
JOIN tbl_ativos e ON a.ati_id = e.pk_ati_id
WHERE a.ale_severidade = 3;

CREATE USER 'app_resende'@'localhost' IDENTIFIED BY 'Senha_Resende_2026';

-- Concede APENAS as permissões de leitura (SELECT) e inserção (INSERT)
GRANT SELECT, INSERT ON sol_resende.tbl_maquinas TO 'app_resende'@'localhost';

-- Criando o usuário do gerente (caso não exista)
CREATE USER 'gerente_fabrica'@'localhost' IDENTIFIED BY 'Gestao2026!';

-- Concedendo acesso apenas ao que ele precisa monitorar
GRANT SELECT ON vw_painel_crises_gerencia TO 'gerente_fabrica'@'localhost';

CREATE USER 'monitor'@'localhost' IDENTIFIED BY '123456';

GRANT SELECT, INSERT ON sol_resende.tbl_maquinas TO 'monitor'@'localhost';



-- Aplica as novas permissões imediatamente
FLUSH PRIVILEGES;