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

#[ORM\Entity]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['item_type:read']],
    denormalizationContext: ['groups' => ['item_type:write']]
)]
class ItemType
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['item_type:read', 'stock_item:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['item_type:read', 'item_type:write', 'stock_item:read'])]
    private ?string $name = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['item_type:read', 'item_type:write'])]
    private ?string $description = null;

    #[ORM\OneToMany(mappedBy: 'type', targetEntity: StockItem::class)]
    private Collection $stockItems;

    public function __construct()
    {
        $this->stockItems = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;
        return $this;
    }

    /**
     * @return Collection<int, StockItem>
     */
    public function getStockItems(): Collection
    {
        return $this->stockItems;
    }

    public function addStockItem(StockItem $stockItem): self
    {
        if (!$this->stockItems->contains($stockItem)) {
            $this->stockItems->add($stockItem);
            $stockItem->setType($this);
        }
        return $this;
    }

    public function removeStockItem(StockItem $stockItem): self
    {
        if ($this->stockItems->removeElement($stockItem)) {
            if ($stockItem->getType() === $this) {
                $stockItem->setType(null);
            }
        }
        return $this;
    }
} 