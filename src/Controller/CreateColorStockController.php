<?php

namespace App\Controller;

use App\Entity\StockItem;
use App\Entity\ColorStock;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;

#[AsController]
class CreateColorStockController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer
    ) {}

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $stockItem = $this->entityManager->getRepository(StockItem::class)->find($id);
        
        if (!$stockItem) {
            return new JsonResponse(['error' => 'Stock item not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['color']) || !isset($data['stockInitial'])) {
            return new JsonResponse(['error' => 'Missing required fields'], 400);
        }

        $colorStock = new ColorStock();
        $colorStock->setStockItem($stockItem);
        $colorStock->setColor($data['color']);
        $colorStock->setStockInitial($data['stockInitial']);

        $this->entityManager->persist($colorStock);
        $this->entityManager->flush();

        return new JsonResponse(
            $this->serializer->normalize(
                $colorStock,
                'json',
                ['groups' => ['color_stock:read']]
            ),
            201
        );
    }
} 