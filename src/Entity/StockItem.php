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
use App\Controller\CreateColorStockController;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Put(),
        new Delete(),
        new Post(
            uriTemplate: '/stock_items/{id}/color-stocks',
            controller: CreateColorStockController::class,
        ),
    ],
    normalizationContext: [
        'groups' => ['stock_item:read'],
        'enable_max_depth' => true
    ],
    denormalizationContext: ['groups' => ['stock_item:write']]
)]
class StockItem
{
    public const LOCATIONS = ['Cotona', 'Maison', 'Avishay', 'Avenir'];
    public const UNITS = ['piece', 'carton', 'bal'];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['stock_item:read', 'stock_movement:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['stock_item:read', 'stock_item:write', 'stock_movement:read'])]
    private ?string $reference = null;

    #[ORM\Column(length: 255)]
    #[Groups(['stock_item:read', 'stock_item:write', 'stock_movement:read'])]
    private ?string $name = null;

    #[ORM\ManyToOne(inversedBy: 'stockItems')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['stock_item:read', 'stock_item:write'])]
    #[MaxDepth(1)]
    private ?ItemType $type = null;

    #[ORM\Column(length: 20)]
    #[Groups(['stock_item:read', 'stock_item:write', 'stock_movement:read'])]
    private ?string $location = null;

    #[ORM\Column(length: 10)]
    #[Groups(['stock_item:read', 'stock_item:write'])]
    private ?string $unit = null;

    #[ORM\Column]
    #[Groups(['stock_item:read', 'stock_item:write'])]
    private ?int $stockInitial = 0;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['stock_item:read', 'stock_item:write'])]
    private ?\DateTimeInterface $dateDernierInventaire = null;

    #[ORM\OneToMany(mappedBy: 'stockItem', targetEntity: StockMovement::class)]
    #[Groups(['stock_item:read'])]
    #[MaxDepth(1)]
    private Collection $movements;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['stock_item:read', 'stock_item:write'])]
    private bool $hasColors = false;

    #[ORM\OneToMany(mappedBy: 'stockItem', targetEntity: ColorStock::class, cascade: ['persist', 'remove'])]
    #[Groups(['stock_item:read', 'stock_item:write'])]
    #[MaxDepth(1)]
    private Collection $colorStocks;

    public function __construct()
    {
        $this->movements = new ArrayCollection();
        $this->colorStocks = new ArrayCollection();
        $this->dateDernierInventaire = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getReference(): ?string
    {
        return $this->reference;
    }

    public function setReference(?string $reference): self
    {
        $this->reference = $reference;
        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getType(): ?ItemType
    {
        return $this->type;
    }

    public function setType(?ItemType $type): self
    {
        $this->type = $type;
        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(string $location): self
    {
        if (!in_array($location, self::LOCATIONS)) {
            throw new \InvalidArgumentException('Invalid location');
        }
        $this->location = $location;
        return $this;
    }

    public function getUnit(): ?string
    {
        return $this->unit;
    }

    public function setUnit(string $unit): self
    {
        if (!in_array($unit, self::UNITS)) {
            throw new \InvalidArgumentException('Invalid unit');
        }
        $this->unit = $unit;
        return $this;
    }

    public function getStockInitial(): ?int
    {
        return $this->stockInitial;
    }

    public function setStockInitial(int $stockInitial): self
    {
        $this->stockInitial = $stockInitial;
        return $this;
    }

    public function getDateDernierInventaire(): ?\DateTimeInterface
    {
        return $this->dateDernierInventaire;
    }

    public function setDateDernierInventaire(\DateTimeInterface $date): self
    {
        $this->dateDernierInventaire = $date;
        return $this;
    }

    public function getHasColors(): bool
    {
        return $this->hasColors;
    }

    public function setHasColors(bool $hasColors): self
    {
        $this->hasColors = $hasColors;
        return $this;
    }

    /**
     * @return Collection<int, ColorStock>
     */
    public function getColorStocks(): Collection
    {
        return $this->colorStocks;
    }

    public function addColorStock(ColorStock $colorStock): self
    {
        if (!$this->colorStocks->contains($colorStock)) {
            $this->colorStocks->add($colorStock);
            $colorStock->setStockItem($this);
        }
        return $this;
    }

    public function removeColorStock(ColorStock $colorStock): self
    {
        if ($this->colorStocks->removeElement($colorStock)) {
            if ($colorStock->getStockItem() === $this) {
                $colorStock->setStockItem(null);
            }
        }
        return $this;
    }

    #[Groups(['stock_item:read'])]
    public function getStockRestant(): int
    {
        if ($this->hasColors) {
            return $this->colorStocks->reduce(function ($total, ColorStock $colorStock) {
                return $total + $colorStock->getStockRestant();
            }, 0);
        }

        $nbEntrees = 0;
        $nbSorties = 0;

        foreach ($this->movements as $movement) {
            if ($movement->getType() === 'entree') {
                $nbEntrees += $movement->getQuantity();
            } else {
                $nbSorties += $movement->getQuantity();
            }
        }

        return $this->stockInitial + $nbEntrees - $nbSorties;
    }

    #[Groups(['stock_item:read'])]
    public function getNbEntrees(): int
    {
        $nbEntrees = 0;
        foreach ($this->movements as $movement) {
            if ($movement->getType() === 'entree') {
                $nbEntrees += $movement->getQuantity();
            }
        }
        return $nbEntrees;
    }

    #[Groups(['stock_item:read'])]
    public function getNbSorties(): int
    {
        $nbSorties = 0;
        foreach ($this->movements as $movement) {
            if ($movement->getType() === 'sortie') {
                $nbSorties += $movement->getQuantity();
            }
        }
        return $nbSorties;
    }

    /**
     * @return Collection<int, StockMovement>
     */
    public function getMovements(): Collection
    {
        return $this->movements;
    }

    public function addMovement(StockMovement $movement): self
    {
        if (!$this->movements->contains($movement)) {
            $this->movements->add($movement);
            $movement->setStockItem($this);
        }
        return $this;
    }

    public function removeMovement(StockMovement $movement): self
    {
        if ($this->movements->removeElement($movement)) {
            if ($movement->getStockItem() === $this) {
                $movement->setStockItem(null);
            }
        }
        return $this;
    }
} 