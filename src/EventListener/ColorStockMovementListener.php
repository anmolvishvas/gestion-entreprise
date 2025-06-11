<?php

namespace App\EventListener;

use App\Entity\ColorStockMovement;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;

#[AsEntityListener(event: Events::prePersist, entity: ColorStockMovement::class)]
#[AsEntityListener(event: Events::preUpdate, entity: ColorStockMovement::class)]
#[AsEntityListener(event: Events::preRemove, entity: ColorStockMovement::class)]
class ColorStockMovementListener
{
    public function prePersist(ColorStockMovement $movement, LifecycleEventArgs $event): void
    {
        $this->updateColorStockCounters($movement);
    }

    public function preUpdate(ColorStockMovement $movement, LifecycleEventArgs $event): void
    {
        $this->updateColorStockCounters($movement);
    }

    public function preRemove(ColorStockMovement $movement, LifecycleEventArgs $event): void
    {
        $colorStock = $movement->getColorStock();
        if (!$colorStock) {
            return;
        }

        if ($movement->getType() === 'entree') {
            $colorStock->setNbEntrees($colorStock->getNbEntrees() - $movement->getQuantity());
            $colorStock->setStockRestant($colorStock->getStockRestant() - $movement->getQuantity());
        } else {
            $colorStock->setNbSorties($colorStock->getNbSorties() - $movement->getQuantity());
            $colorStock->setStockRestant($colorStock->getStockRestant() + $movement->getQuantity());
        }
    }

    private function updateColorStockCounters(ColorStockMovement $movement): void
    {
        $colorStock = $movement->getColorStock();
        if (!$colorStock) {
            return;
        }

        if ($movement->getType() === 'entree') {
            $colorStock->setNbEntrees($colorStock->getNbEntrees() + $movement->getQuantity());
            $colorStock->setStockRestant($colorStock->getStockRestant() + $movement->getQuantity());
        } else {
            $colorStock->setNbSorties($colorStock->getNbSorties() + $movement->getQuantity());
            $colorStock->setStockRestant($colorStock->getStockRestant() - $movement->getQuantity());
        }
    }
} 