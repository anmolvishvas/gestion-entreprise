<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250613191701 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE prix ADD type VARCHAR(100) NOT NULL, ADD prix_afficher VARCHAR(255) DEFAULT NULL, ADD dernier_prix VARCHAR(255) DEFAULT NULL, CHANGE reference reference VARCHAR(255) DEFAULT NULL, CHANGE prix_unitaire prix_unitaire VARCHAR(255) DEFAULT NULL, CHANGE prix_paquet_detail prix_paquet_detail VARCHAR(255) DEFAULT NULL, CHANGE prix_paquet_gros prix_paquet_gros VARCHAR(255) DEFAULT NULL, CHANGE prix_carton prix_carton VARCHAR(255) DEFAULT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE prix DROP type, DROP prix_afficher, DROP dernier_prix, CHANGE reference reference VARCHAR(255) NOT NULL, CHANGE prix_unitaire prix_unitaire VARCHAR(255) NOT NULL, CHANGE prix_paquet_detail prix_paquet_detail VARCHAR(255) NOT NULL, CHANGE prix_paquet_gros prix_paquet_gros VARCHAR(255) NOT NULL, CHANGE prix_carton prix_carton VARCHAR(255) NOT NULL
        SQL);
    }
}
