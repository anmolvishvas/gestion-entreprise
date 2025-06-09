import { useState, useEffect } from "react";
import { ArrowDown, Package, Plus, Search } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { stockItemService } from "../services/stockItemService";
import { stockMovementService } from "../services/stockMovementService";
import { itemTypeService } from "../services/itemTypeService";
import type { StockItem } from "../services/stockItemService";
import type { ItemType } from "../services/itemTypeService";
import { useAppContext } from "../context/AppContext";

export default function StockEntry() {
    const navigate = useNavigate();
    const { stockItems, stockMovements, addStockMovement, refreshStockData } =
        useAppContext();

    // For existing item entry
    const [selectedItemId, setSelectedItemId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState<string>("");

    // For new item entry
    const [newItemMode, setNewItemMode] = useState<boolean>(false);
    const [newItemName, setNewItemName] = useState<string>("");
    const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
    const [newItemLocation, setNewItemLocation] = useState<
        "Cotona" | "Maison" | "Avishay" | "Avenir"
    >("Cotona");
    const [newItemType, setNewItemType] = useState<string>("");
    const [newItemUnit, setNewItemUnit] = useState<"piece" | "unite">("piece");
    const [newItemReference, setNewItemReference] = useState<string>("");

    // For searching items
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const types = await itemTypeService.getAll();
                setItemTypes(types);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Erreur lors du chargement des données");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredItems = stockItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmitExistingItem = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedItemId || quantity <= 0) {
            alert(
                "Veuillez sélectionner un article et entrer une quantité valide"
            );
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await addStockMovement({
                date: new Date().toISOString(),
                stockItem: `/api/stock_items/${selectedItemId}`,
                type: "entree",
                quantity,
                notes: notes || "Entrée de stock",
            });

            navigate("/stock/movements");
        } catch (err) {
            console.error("Error creating stock movement:", err);
            setError("Erreur lors de l'ajout du mouvement de stock");
            setLoading(false);
        }
    };

    const handleSubmitNewItem = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newItemName || newItemQuantity <= 0 || !newItemType) {
            alert("Veuillez remplir tous les champs requis");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Create new stock item
            await stockItemService.create({
                reference: newItemReference || null,
                name: newItemName,
                type: `/api/item_types/${newItemType}`,
                location: newItemLocation,
                unit: newItemUnit,
                stockInitial: newItemQuantity,
                dateDernierInventaire: new Date().toISOString(),
            });

            await refreshStockData();

            // Reset form
            setSelectedItemId("");
            setQuantity(1);
            setNotes("");
            setNewItemMode(false);
            setNewItemName("");
            setNewItemQuantity(1);
            setNewItemType("");
            setNewItemReference("");

            // Navigate back to stock list
            navigate("/stock/liste");
        } catch (err) {
            console.error("Error creating stock item:", err);
            setError("Erreur lors de la création de l'article");
            setLoading(false);
        }
    };

    if (loading && !stockItems.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des données...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Entrée de Stock
                </h1>
                <p className="mt-1 text-gray-600">
                    Ajoutez des articles à votre inventaire
                </p>
            </div>

            {/* Error message display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                    {error}
                </div>
            )}

            {/* Toggle between existing and new item */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                        className={`flex-1 py-2 px-4 rounded-md text-center ${
                            !newItemMode
                                ? "bg-blue-600 text-white font-medium"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => setNewItemMode(false)}
                    >
                        Article existant
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 rounded-md text-center ${
                            newItemMode
                                ? "bg-blue-600 text-white font-medium"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => setNewItemMode(true)}
                    >
                        Nouvel article
                    </button>
                </div>
            </div>

            {/* Forms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main form */}
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow">
                        {!newItemMode ? (
                            <form onSubmit={handleSubmitExistingItem}>
                                <div className="mb-6">
                                    <div className="flex items-center mb-1">
                                        <ArrowDown className="h-5 w-5 text-green-600 mr-2" />
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Entrée d'un article existant
                                        </h2>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Ajoutez du stock à un article existant
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="itemSearch"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Rechercher un article
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="itemSearch"
                                            className="input pl-10 w-full"
                                            placeholder="Rechercher un article..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="selectedItem"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Sélectionner un article
                                    </label>
                                    <select
                                        id="selectedItem"
                                        className="input w-full"
                                        value={selectedItemId}
                                        onChange={(e) =>
                                            setSelectedItemId(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">
                                            Sélectionnez un article
                                        </option>

                                        <optgroup label="Cotona">
                                            {filteredItems
                                                .filter(
                                                    (item) =>
                                                        item.location ===
                                                        "Cotona"
                                                )
                                                .map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.name} (
                                                        {item.stockRestant} en
                                                        stock)
                                                    </option>
                                                ))}
                                        </optgroup>

                                        <optgroup label="Maison">
                                            {filteredItems
                                                .filter(
                                                    (item) =>
                                                        item.location ===
                                                        "Maison"
                                                )
                                                .map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.name} (
                                                        {item.stockRestant ||
                                                            item.stockInitial}{" "}
                                                        en stock)
                                                    </option>
                                                ))}
                                        </optgroup>

                                        <optgroup label="Avishay">
                                            {filteredItems
                                                .filter(
                                                    (item) =>
                                                        item.location ===
                                                        "Avishay"
                                                )
                                                .map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.name} (
                                                        {item.stockRestant ||
                                                            item.stockInitial}{" "}
                                                        en stock)
                                                    </option>
                                                ))}
                                        </optgroup>

                                        <optgroup label="Avenir">
                                            {filteredItems
                                                .filter(
                                                    (item) =>
                                                        item.location ===
                                                        "Avenir"
                                                )
                                                .map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.name} (
                                                        {item.stockRestant ||
                                                            item.stockInitial}{" "}
                                                        en stock)
                                                    </option>
                                                ))}
                                        </optgroup>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="quantity"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Quantité à ajouter
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        className="input w-full"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(
                                                Math.max(
                                                    1,
                                                    parseInt(e.target.value) ||
                                                        0
                                                )
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label
                                        htmlFor="notes"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Notes (optionnel)
                                    </label>
                                    <textarea
                                        id="notes"
                                        className="input w-full"
                                        rows={3}
                                        placeholder="Informations supplémentaires..."
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Ajout en cours..."
                                            : "Ajouter au stock"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmitNewItem}>
                                <div className="mb-6">
                                    <div className="flex items-center mb-1">
                                        <Plus className="h-5 w-5 text-blue-600 mr-2" />
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Ajouter un nouvel article
                                        </h2>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Créez un nouvel article dans
                                        l'inventaire
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="newItemName"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Nom de l'article
                                    </label>
                                    <input
                                        type="text"
                                        id="newItemName"
                                        className="input w-full"
                                        placeholder="Nom de l'article"
                                        value={newItemName}
                                        onChange={(e) =>
                                            setNewItemName(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="newItemReference"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Référence (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        id="newItemReference"
                                        className="input w-full"
                                        placeholder="Référence de l'article"
                                        value={newItemReference}
                                        onChange={(e) =>
                                            setNewItemReference(e.target.value)
                                        }
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Si non renseignée, une référence sera
                                        générée automatiquement
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label
                                            htmlFor="newItemLocation"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Emplacement
                                        </label>
                                        <select
                                            id="newItemLocation"
                                            className="input w-full"
                                            value={newItemLocation}
                                            onChange={(e) =>
                                                setNewItemLocation(
                                                    e.target.value as
                                                        | "Cotona"
                                                        | "Maison"
                                                        | "Avishay"
                                                        | "Avenir"
                                                )
                                            }
                                        >
                                            <option value="Cotona">
                                                Cotona
                                            </option>
                                            <option value="Maison">
                                                Maison
                                            </option>
                                            <option value="Avishay">
                                                Avishay
                                            </option>
                                            <option value="Avenir">
                                                Avenir
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="newItemType"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Type
                                        </label>
                                        <div className="flex space-x-2">
                                            <select
                                                id="newItemType"
                                                className="input flex-1"
                                                value={newItemType}
                                                onChange={(e) =>
                                                    setNewItemType(
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Sélectionnez un type
                                                </option>
                                                {itemTypes.map((type) => (
                                                    <option
                                                        key={type.id}
                                                        value={type.id}
                                                    >
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <Link
                                                to="/item-types"
                                                className="btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                                            >
                                                Gérer les types
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label
                                            htmlFor="newItemQuantity"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Quantité initiale
                                        </label>
                                        <input
                                            type="number"
                                            id="newItemQuantity"
                                            className="input w-full"
                                            min="1"
                                            value={newItemQuantity}
                                            onChange={(e) =>
                                                setNewItemQuantity(
                                                    Math.max(
                                                        1,
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="newItemUnit"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Unité
                                        </label>
                                        <select
                                            id="newItemUnit"
                                            className="input w-full"
                                            value={newItemUnit}
                                            onChange={(e) =>
                                                setNewItemUnit(
                                                    e.target.value as
                                                        | "piece"
                                                        | "unite"
                                                )
                                            }
                                        >
                                            <option value="piece">Pièce</option>
                                            <option value="unite">Unité</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="btn bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Création en cours..."
                                            : "Créer et ajouter"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Help sidebar */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Instructions
                        </h3>
                        {!newItemMode ? (
                            <div className="space-y-3 text-sm text-gray-600">
                                <p>
                                    1. Recherchez l'article dans le champ de
                                    recherche
                                </p>
                                <p>
                                    2. Sélectionnez l'article dans la liste
                                    déroulante
                                </p>
                                <p>3. Entrez la quantité à ajouter au stock</p>
                                <p>4. Ajoutez éventuellement des notes</p>
                                <p>
                                    5. Cliquez sur "Ajouter au stock" pour
                                    valider
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 text-sm text-gray-600">
                                <p>1. Entrez le nom du nouvel article</p>
                                <p>
                                    2. Sélectionnez l'emplacement où l'article
                                    sera stocké
                                </p>
                                <p>3. Choisissez le type de l'article</p>
                                <p>
                                    4. Définissez la quantité initiale en stock
                                </p>
                                <p>
                                    5. Sélectionnez l'unité de mesure (pièce ou
                                    unité)
                                </p>
                                <p>
                                    6. Cliquez sur "Créer et ajouter" pour
                                    valider
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <div className="flex items-center mb-3">
                            <Package className="h-5 w-5 text-indigo-600 mr-2" />
                            <h3 className="font-semibold text-indigo-900">
                                Conseil
                            </h3>
                        </div>
                        <p className="text-sm text-indigo-700">
                            Pour un nouvel arrivage de produits existants,
                            utilisez "Article existant". Pour ajouter un nouveau
                            type de produit à votre catalogue, utilisez "Nouvel
                            article".
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
