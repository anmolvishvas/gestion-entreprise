<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\PrixRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PrixRepository::class)]
#[ApiResource(
    shortName: 'Prix',
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['prix:read']],
            filters: ['prix.search_filter']
        ),
        new Get(
            normalizationContext: ['groups' => ['prix:read']]
        ),
        new Post(
            normalizationContext: ['groups' => ['prix:read']],
            denormalizationContext: ['groups' => ['prix:write']]
        ),
        new Put(
            normalizationContext: ['groups' => ['prix:read']],
            denormalizationContext: ['groups' => ['prix:write']]
        ),
        new Delete()
    ]
)]
#[ApiFilter(SearchFilter::class, properties: ['nomArticle' => 'partial', 'reference' => 'partial'])]
class Prix
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['prix:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['prix:read', 'prix:write'])]
    private ?string $nomArticle = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['prix:read', 'prix:write'])]
    private ?string $reference = null;

    #[ORM\Column(length: 100)]
    #[Groups(['prix:read', 'prix:write'])]
    private string $type;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['prix:read', 'prix:write'])]
    private ?string $prixUnitaire = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['prix:read', 'prix:write'])]
    private ?string $prixPaquetDetail = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['prix:read', 'prix:write'])]
    private ?string $prixPaquetGros = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['prix:read', 'prix:write'])]
    private ?string $prixCarton = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['prix:read', 'prix:write'])]
    private ?string $prixAfficher = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['prix:read', 'prix:write'])]
    private ?string $dernierPrix = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNomArticle(): ?string
    {
        return $this->nomArticle;
    }

    public function setNomArticle(string $nomArticle): static
    {
        $this->nomArticle = $nomArticle;
        return $this;
    }

    public function getReference(): ?string
    {
        return $this->reference;
    }

    public function setReference(string $reference): static
    {
        $this->reference = $reference;
        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getPrixUnitaire(): ?string
    {
        return $this->prixUnitaire;
    }

    public function setPrixUnitaire(string $prixUnitaire): static
    {
        $this->prixUnitaire = $prixUnitaire;
        return $this;
    }

    public function getPrixPaquetDetail(): ?string
    {
        return $this->prixPaquetDetail;
    }

    public function setPrixPaquetDetail(string $prixPaquetDetail): static
    {
        $this->prixPaquetDetail = $prixPaquetDetail;
        return $this;
    }

    public function getPrixPaquetGros(): ?string
    {
        return $this->prixPaquetGros;
    }

    public function setPrixPaquetGros(string $prixPaquetGros): static
    {
        $this->prixPaquetGros = $prixPaquetGros;
        return $this;
    }

    public function getPrixCarton(): ?string
    {
        return $this->prixCarton;
    }

    public function setPrixCarton(?string $prixCarton): static
    {
        $this->prixCarton = $prixCarton;
        return $this;
    }

    public function getPrixAfficher(): ?string
    {
        return $this->prixAfficher;
    }

    public function setPrixAfficher(?string $prixAfficher): static
    {
        $this->prixAfficher = $prixAfficher;
        return $this;
    }

    public function getDernierPrix(): ?string
    {
        return $this->dernierPrix;
    }

    public function setDernierPrix(?string $dernierPrix): static
    {
        $this->dernierPrix = $dernierPrix;
        return $this;
    }
} 