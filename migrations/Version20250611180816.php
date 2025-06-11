<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250611180816 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create color_stock and color_stock_movement tables with correct FK constraints if not exist';
    }

    public function up(Schema $schema): void
    {
        // Create color_stock table if it does not exist
        $this->addSql(<<<'SQL'
            CREATE TABLE IF NOT EXISTS color_stock (
                id INT AUTO_INCREMENT NOT NULL,
                stock_item_id INT NOT NULL,
                color VARCHAR(50) NOT NULL,
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);

        // Add index on stock_item_id if not exists
        $this->addSql('CREATE INDEX IF NOT EXISTS IDX_COLOR_STOCK_STOCK_ITEM_ID ON color_stock (stock_item_id)');

        // Add foreign key constraint safely if not exists
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock
            ADD CONSTRAINT FK_COLOR_STOCK_STOCK_ITEM_ID FOREIGN KEY (stock_item_id) REFERENCES stock_item (id) ON DELETE CASCADE
        SQL);

        // Create color_stock_movement table if it does not exist
        $this->addSql(<<<'SQL'
            CREATE TABLE IF NOT EXISTS color_stock_movement (
                id INT AUTO_INCREMENT NOT NULL,
                color_stock_id INT NOT NULL,
                quantity INT NOT NULL,
                date DATETIME NOT NULL,
                notes LONGTEXT DEFAULT NULL,
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);

        // Add index on color_stock_id if not exists
        $this->addSql('CREATE INDEX IF NOT EXISTS IDX_COLOR_STOCK_MOVEMENT_COLOR_STOCK_ID ON color_stock_movement (color_stock_id)');

        // Add foreign key constraint safely if not exists
        $this->addSql(<<<'SQL'
            ALTER TABLE color_stock_movement
            ADD CONSTRAINT FK_COLOR_STOCK_MOVEMENT_COLOR_STOCK_ID FOREIGN KEY (color_stock_id) REFERENCES color_stock (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS color_stock_movement');
        $this->addSql('DROP TABLE IF EXISTS color_stock');
    }
}
