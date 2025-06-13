<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250613141256 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE prix (id INT AUTO_INCREMENT NOT NULL, nom_article VARCHAR(255) NOT NULL, reference VARCHAR(255) NOT NULL, prix_unitaire VARCHAR(255) NOT NULL, prix_paquet_detail VARCHAR(255) NOT NULL, prix_paquet_gros VARCHAR(255) NOT NULL, prix_carton VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock_movement DROP stock_movement_id
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            DROP TABLE prix
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock_movement ADD stock_movement_id INT NOT NULL
        SQL);
    }
}
