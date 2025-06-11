<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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
        'groups' => ['color_stock:read', 'stock_item:read'],
        'enable_max_depth' => true
    ],
    denormalizationContext: ['groups' => ['color_stock:write']]
)]
class ColorStock
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['color_stock:read', 'stock_item:read', 'color_movement:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['color_stock:read', 'color_stock:write', 'stock_item:read', 'color_movement:read'])]
    private ?string $color = null;

    #[ORM\Column]
    #[Groups(['color_stock:read', 'color_stock:write', 'stock_item:read', 'color_movement:read'])]
    private ?int $stockInitial = null;

    #[ORM\Column]
    #[Groups(['color_stock:read', 'stock_item:read', 'color_movement:read'])]
    private ?int $stockRestant = null;

    #[ORM\Column]
    #[Groups(['color_stock:read', 'stock_item:read', 'color_movement:read'])]
    private ?int $nbEntrees = 0;

    #[ORM\Column]
    #[Groups(['color_stock:read', 'stock_item:read', 'color_movement:read'])]
    private ?int $nbSorties = 0;

    #[ORM\OneToMany(mappedBy: 'colorStock', targetEntity: ColorStockMovement::class, orphanRemoval: true)]
    #[MaxDepth(1)]
    private Collection $movements;

    #[ORM\ManyToOne(inversedBy: 'colorStocks')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['color_stock:read', 'color_stock:write', 'color_movement:read'])]
    #[MaxDepth(1)]
    private ?StockItem $stockItem = null;

    public function __construct()
    {
        $this->movements = new ArrayCollection();
        $this->stockRestant = 0;
        $this->nbEntrees = 0;
        $this->nbSorties = 0;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(string $color): self
    {
        $this->color = $color;
        return $this;
    }

    public function getStockInitial(): ?int
    {
        return $this->stockInitial;
    }

    public function setStockInitial(int $stockInitial): self
    {
        $this->stockInitial = $stockInitial;
        $this->stockRestant = $stockInitial;
        return $this;
    }

    public function getStockRestant(): ?int
    {
        return $this->stockRestant;
    }

    public function setStockRestant(int $stockRestant): self
    {
        $this->stockRestant = $stockRestant;
        return $this;
    }

    public function getNbEntrees(): ?int
    {
        return $this->nbEntrees;
    }

    public function setNbEntrees(int $nbEntrees): self
    {
        $this->nbEntrees = $nbEntrees;
        return $this;
    }

    public function getNbSorties(): ?int
    {
        return $this->nbSorties;
    }

    public function setNbSorties(int $nbSorties): self
    {
        $this->nbSorties = $nbSorties;
        return $this;
    }

    /**
     * @return Collection<int, ColorStockMovement>
     */
    public function getMovements(): Collection
    {
        return $this->movements;
    }

    public function addMovement(ColorStockMovement $movement): self
    {
        if (!$this->movements->contains($movement)) {
            $this->movements->add($movement);
            $movement->setColorStock($this);
        }

        return $this;
    }

    public function removeMovement(ColorStockMovement $movement): self
    {
        if ($this->movements->removeElement($movement)) {
            // set the owning side to null (unless already changed)
            if ($movement->getColorStock() === $this) {
                $movement->setColorStock(null);
            }
        }

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
} 