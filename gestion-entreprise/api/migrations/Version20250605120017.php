<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250605120017 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE item_type (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE stock_item ADD reference VARCHAR(255) NOT NULL, ADD stock_initial INT NOT NULL, ADD date_dernier_inventaire DATETIME NOT NULL, DROP type, CHANGE quantity type_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE stock_item ADD CONSTRAINT FK_6017DDAC54C8C93 FOREIGN KEY (type_id) REFERENCES item_type (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_6017DDAAEA34913 ON stock_item (reference)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6017DDAC54C8C93 ON stock_item (type_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE stock_movement CHANGE date date DATETIME NOT NULL, CHANGE notes notes LONGTEXT DEFAULT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE stock_item DROP FOREIGN KEY FK_6017DDAC54C8C93
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE item_type
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX UNIQ_6017DDAAEA34913 ON stock_item
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_6017DDAC54C8C93 ON stock_item
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE stock_item ADD quantity INT NOT NULL, ADD type VARCHAR(20) NOT NULL, DROP type_id, DROP reference, DROP stock_initial, DROP date_dernier_inventaire
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE stock_movement CHANGE date date DATE NOT NULL, CHANGE notes notes LONGTEXT NOT NULL
        SQL);
    }
}
