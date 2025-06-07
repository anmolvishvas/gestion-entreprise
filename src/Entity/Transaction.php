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

#[ORM\Entity]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['transaction:read', 'transaction:fournisseur']]),
        new GetCollection(normalizationContext: ['groups' => ['transaction:read', 'transaction:fournisseur']]),
        new Post(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['transaction:read', 'transaction:fournisseur']],
    denormalizationContext: ['groups' => ['transaction:write']]
)]
class Transaction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['transaction:read', 'fournisseur:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'date')]
    #[Groups(['transaction:read', 'transaction:write', 'fournisseur:read'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\ManyToOne(inversedBy: 'transactions')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['transaction:read', 'transaction:write', 'transaction:fournisseur'])]
    private ?Fournisseur $fournisseur = null;

    #[ORM\Column]
    #[Groups(['transaction:read', 'transaction:write', 'fournisseur:read'])]
    private ?float $achat = null;

    #[ORM\Column]
    #[Groups(['transaction:read', 'transaction:write', 'fournisseur:read'])]
    private ?float $virement = null;

    #[ORM\Column]
    #[Groups(['transaction:read', 'transaction:write', 'fournisseur:read'])]
    private ?float $reste = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['transaction:read', 'transaction:write', 'fournisseur:read'])]
    private ?string $description = null;

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

    public function getFournisseur(): ?Fournisseur
    {
        return $this->fournisseur;
    }

    public function setFournisseur(?Fournisseur $fournisseur): self
    {
        $this->fournisseur = $fournisseur;
        return $this;
    }

    public function getAchat(): ?float
    {
        return $this->achat;
    }

    public function setAchat(float $achat): self
    {
        $this->achat = $achat;
        return $this;
    }

    public function getVirement(): ?float
    {
        return $this->virement;
    }

    public function setVirement(float $virement): self
    {
        $this->virement = $virement;
        return $this;
    }

    public function getReste(): ?float
    {
        return $this->reste;
    }

    public function setReste(float $reste): self
    {
        $this->reste = $reste;
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
} 