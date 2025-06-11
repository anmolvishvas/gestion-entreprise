<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: [
        'groups' => ['color_movement:read', 'stock_item:read'],
        'enable_max_depth' => true
    ],
    denormalizationContext: ['groups' => ['color_movement:write']]
)]
class ColorStockMovement
{
    public const MOVEMENT_TYPE = 'color';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['color_movement:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'movements')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['color_movement:read', 'color_movement:write', 'stock_item:read'])]
    #[MaxDepth(2)]
    private ?ColorStock $colorStock = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['color_movement:read', 'color_movement:write'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\Column(length: 10)]
    #[Groups(['color_movement:read', 'color_movement:write'])]
    private ?string $type = null;

    #[ORM\Column]
    #[Groups(['color_movement:read', 'color_movement:write'])]
    private ?int $quantity = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['color_movement:read', 'color_movement:write'])]
    private ?string $notes = null;

    #[ORM\Column(type: 'string', length: 20)]
    #[Groups(['color_movement:read'])]
    private string $movementType = self::MOVEMENT_TYPE;

    public function __construct()
    {
        $this->date = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getColorStock(): ?ColorStock
    {
        return $this->colorStock;
    }

    public function setColorStock(?ColorStock $colorStock): self
    {
        $this->colorStock = $colorStock;
        return $this;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): self
    {
        $this->date = $date;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        if (!in_array($type, ['entree', 'sortie'])) {
            throw new \InvalidArgumentException('Invalid type');
        }
        $this->type = $type;
        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): self
    {
        $this->quantity = $quantity;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): self
    {
        $this->notes = $notes;
        return $this;
    }

    public function getMovementType(): string
    {
        return $this->movementType;
    }

    public function setMovementType(string $movementType): self
    {
        $this->movementType = $movementType;
        return $this;
    }

    public function getStockItem(): ?StockItem
    {
        return $this->colorStock?->getStockItem();
    }
} 