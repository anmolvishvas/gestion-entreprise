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
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['stock_movement:read']],
    denormalizationContext: ['groups' => ['stock_movement:write']]
)]
class StockMovement
{
    public const TYPES = ['entree', 'sortie'];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['stock_movement:read', 'stock_item:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['stock_movement:read', 'stock_movement:write', 'stock_item:read'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\ManyToOne(inversedBy: 'movements')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['stock_movement:read', 'stock_movement:write'])]
    private ?StockItem $stockItem = null;

    #[ORM\Column(length: 10)]
    #[Assert\Choice(choices: self::TYPES)]
    #[Groups(['stock_movement:read', 'stock_movement:write', 'stock_item:read'])]
    private ?string $type = null;

    #[ORM\Column]
    #[Assert\Positive]
    #[Groups(['stock_movement:read', 'stock_movement:write', 'stock_item:read'])]
    private ?int $quantity = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['stock_movement:read', 'stock_movement:write', 'stock_item:read'])]
    private ?string $notes = null;

    public function __construct()
    {
        $this->date = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getStockItem(): ?StockItem
    {
        return $this->stockItem;
    }

    public function setStockItem(?StockItem $stockItem): self
    {
        $this->stockItem = $stockItem;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        if (!in_array($type, self::TYPES)) {
            throw new \InvalidArgumentException('Invalid movement type');
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
} 