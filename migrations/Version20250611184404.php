<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250611184404 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock DROP FOREIGN KEY FK_COLOR_STOCK_STOCK_ITEM_ID
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_COLOR_STOCK_STOCK_ITEM_ID ON color_stock
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock ADD stock_restant INT NOT NULL, ADD nb_entrees INT NOT NULL, ADD nb_sorties INT NOT NULL, CHANGE color color VARCHAR(255) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock_movement DROP FOREIGN KEY FK_COLOR_STOCK_MOVEMENT_COLOR_STOCK_ID
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_COLOR_STOCK_MOVEMENT_COLOR_STOCK_ID ON color_stock_movement
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock_movement ADD movement_type VARCHAR(20) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE stock_movement ADD movement_type VARCHAR(20) NOT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock DROP stock_restant, DROP nb_entrees, DROP nb_sorties, CHANGE color color VARCHAR(50) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock ADD CONSTRAINT FK_COLOR_STOCK_STOCK_ITEM_ID FOREIGN KEY (stock_item_id) REFERENCES stock_item (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_COLOR_STOCK_STOCK_ITEM_ID ON color_stock (stock_item_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock_movement DROP movement_type
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock_movement ADD CONSTRAINT FK_COLOR_STOCK_MOVEMENT_COLOR_STOCK_ID FOREIGN KEY (color_stock_id) REFERENCES color_stock (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_COLOR_STOCK_MOVEMENT_COLOR_STOCK_ID ON color_stock_movement (color_stock_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE stock_movement DROP movement_type
        SQL);
    }
}
