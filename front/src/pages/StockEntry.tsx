import { useState, useEffect } from "react";
import { ArrowDown, Package, Plus, Search, ArrowLeft, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { stockItemService } from "../services/stockItemService";
import { stockMovementService } from "../services/stockMovementService";
import { itemTypeService } from "../services/itemTypeService";
import type { StockItem } from "../services/stockItemService";
import type { ItemType } from "../services/itemTypeService";
import { useAppContext } from "../context/AppContext";

export default function StockEntry() {
    const navigate = useNavigate();
    const { stockItems, addStockMovement, refreshStockData } =
        useAppContext();

    // For existing item entry
    const [selectedItemId, setSelectedItemId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(0);
    const [notes, setNotes] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

    // For new item entry
    const [newItemMode, setNewItemMode] = useState<boolean>(false);
    const [newItemName, setNewItemName] = useState<string>("");
    const [newItemQuantity, setNewItemQuantity] = useState<number>(0);
    const [newItemLocation, setNewItemLocation] = useState<
        "Cotona" | "Maison" | "Avishay" | "Avenir"
    >("Cotona");
    const [newItemType, setNewItemType] = useState<string>("");
    const [newItemUnit, setNewItemUnit] = useState<"piece" | "carton" | "bal">("piece");
    const [newItemReference, setNewItemReference] = useState<string>("");
    const [newItemHasColors, setNewItemHasColors] = useState<boolean>(false);
    const [colorStocks, setColorStocks] = useState<Array<{ color: string; stockInitial: number }>>([]);

    // For type modal
    const [isTypeModalOpen, setIsTypeModalOpen] = useState<boolean>(false);
    const [newTypeName, setNewTypeName] = useState<string>("");
    const [isSubmittingType, setIsSubmittingType] = useState<boolean>(false);

    // For searching items
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Ajout des nouveaux states en haut du fichier, après les states existants
    const [isNewColor, setIsNewColor] = useState<boolean>(false);
    const [newColorName, setNewColorName] = useState<string>("");
    const [newColorQuantity, setNewColorQuantity] = useState<number>(0);

    // Fetch data on component mount
    useEffect(() => {
        fetchItemTypes();
    }, []);

    const fetchItemTypes = async () => {
        try {
            const types = await itemTypeService.getAll();
            setItemTypes(types);
        } catch (err) {
            console.error("Error fetching item types:", err);
            setError("Erreur lors du chargement des types d'articles");
        }
    };

    const handleAddType = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newTypeName.trim()) {
            setError("Veuillez entrer un nom de type");
            return;
        }

        setIsSubmittingType(true);
        setError(null);

        try {
            await itemTypeService.create({ name: newTypeName });
            await fetchItemTypes();
            setNewTypeName("");
            setIsTypeModalOpen(false);
        } catch (err) {
            console.error("Error creating item type:", err);
            setError("Erreur lors de la création du type d'article");
        } finally {
            setIsSubmittingType(false);
        }
    };

    const filteredItems = stockItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmitExistingItem = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedItemId || quantity <= 0) {
            alert("Veuillez sélectionner un article et entrer une quantité valide");
            return;
        }

        if (!selectedItem) return;

        setLoading(true);
        setError(null);

        try {
            if (selectedItem.hasColors) {
                if (!selectedColor) {
                    throw new Error("Veuillez sélectionner une couleur");
                }

                if (selectedColor === 'new') {
                    if (!newColorName.trim()) {
                        throw new Error("Veuillez entrer un nom de couleur");
                    }
                    if (newColorQuantity <= 0) {
                        throw new Error("Veuillez entrer une quantité valide");
                    }

                    // Create new color stock
                    const colorStock = await stockItemService.createColorStock(selectedItem.id, {
                        color: newColorName,
                        stockInitial: newColorQuantity
                    });

                    // Create movement for the new color stock
                    await stockMovementService.createColorMovement({
                        colorStock: `/api/color_stocks/${colorStock.id}`,
                        type: 'entree',
                        quantity: newColorQuantity,
                        date: new Date().toISOString(),
                        notes: notes || "Entrée de stock"
                    });
                } else {
                    const colorStock = selectedItem.colorStocks?.find(cs => cs.color === selectedColor);
                    if (!colorStock) {
                        throw new Error("Couleur non trouvée");
                    }

                    // Create movement for existing color stock
                    await stockMovementService.createColorMovement({
                        colorStock: `/api/color_stocks/${colorStock.id}`,
                        type: 'entree',
                        quantity,
                        date: new Date().toISOString(),
                        notes: notes || "Entrée de stock"
                    });
                }
            } else {
                await addStockMovement({
                    date: new Date().toISOString(),
                    stockItem: `/api/stock_items/${selectedItemId}`,
                    type: "entree",
                    quantity,
                    notes: notes || "Entrée de stock",
                });
            }

            await refreshStockData();
            navigate("/stock/movements");
        } catch (err) {
            console.error("Error creating stock movement:", err);
            setError(typeof err === 'string' ? err : "Erreur lors de l'ajout du mouvement de stock");
            setLoading(false);
        }
    };

    const handleSubmitNewItem = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newItemName || !newItemType || (!newItemHasColors && newItemQuantity <= 0)) {
            alert("Veuillez remplir tous les champs requis");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (newItemHasColors && colorStocks.length === 0) {
                setError("Veuillez ajouter au moins une couleur");
                return;
            }

            if (newItemHasColors && colorStocks.some(stock => !stock.color.trim())) {
                setError("Veuillez remplir tous les noms de couleurs");
                return;
            }

            // Create new stock item
            const newItem = await stockItemService.create({
                reference: newItemReference || null,
                name: newItemName,
                type: `/api/item_types/${newItemType}`,
                location: newItemLocation,
                unit: newItemUnit,
                stockInitial: newItemHasColors ? 0 : newItemQuantity, // Si gestion des couleurs, le stock initial global est 0
                dateDernierInventaire: new Date().toISOString(),
                hasColors: newItemHasColors
            });

            // Si l'article a des couleurs, créer les stocks de couleurs
            if (newItemHasColors) {
                for (const colorStock of colorStocks) {
                    await stockItemService.createColorStock(newItem.id, {
                        color: colorStock.color,
                        stockInitial: colorStock.stockInitial
                    });
                }
            }

            await refreshStockData();

            // Reset form
            setSelectedItemId("");
            setQuantity(0);
            setNotes("");
            setNewItemMode(false);
            setNewItemName("");
            setNewItemQuantity(0);
            setNewItemType("");
            setNewItemReference("");
            setNewItemHasColors(false);
            setColorStocks([]);

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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link 
                        to="/stock"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200 text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-transparent bg-clip-text">
                            Entrée de Stock
                        </span>
                    </h1>
                </div>
                <p className="text-lg text-gray-600">
                    Ajoutez des articles à votre inventaire ou créez de nouveaux articles
                </p>
            </div>

            {/* Error message display */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-800 rounded-xl p-4 mb-6 flex items-center">
                    <div className="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                    {error}
                </div>
            )}

            {/* Toggle between existing and new item */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        className={`flex-1 py-3 px-6 rounded-xl text-center transition-all duration-200 ${
                            !newItemMode
                                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-sm"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setNewItemMode(false)}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <ArrowDown className={`h-5 w-5 ${!newItemMode ? "text-emerald-100" : "text-gray-400"}`} />
                            <span>Article existant</span>
                        </div>
                    </button>
                    <button
                        className={`flex-1 py-3 px-6 rounded-xl text-center transition-all duration-200 ${
                            newItemMode
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-sm"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setNewItemMode(true)}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Plus className={`h-5 w-5 ${newItemMode ? "text-blue-100" : "text-gray-400"}`} />
                            <span>Nouvel article</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 divide-y divide-gray-100">
                        {!newItemMode ? (
                            <form onSubmit={handleSubmitExistingItem}>
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                            <ArrowDown className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                Entrée d'un article existant
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Ajoutez du stock à un article existant
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-6">
                                        <label
                                            htmlFor="itemSearch"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Rechercher un article
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="itemSearch"
                                                className="w-full px-4 py-2.5 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                                                placeholder="Rechercher un article..."
                                                value={searchTerm}
                                                onChange={(e) =>
                                                    setSearchTerm(e.target.value)
                                                }
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Search className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label
                                            htmlFor="selectedItem"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Sélectionner un article
                                        </label>
                                        <select
                                            id="selectedItem"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                                            value={selectedItemId}
                                            onChange={(e) => {
                                                const itemId = e.target.value;
                                                setSelectedItemId(itemId);
                                                const item = stockItems.find(item => item.id.toString() === itemId);
                                                setSelectedItem(item || null);
                                                setSelectedColor('');
                                            }}
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

                                    <div className="mb-6">
                                        <label
                                            htmlFor="quantity"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Quantité à ajouter
                                        </label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                                            min="1"
                                            value={quantity || ''}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                setQuantity(isNaN(value) ? 0 : value);
                                            }}
                                            onBlur={() => {
                                                if (quantity <= 0) {
                                                    setQuantity(0);
                                                }
                                            }}
                                            required
                                            placeholder="Entrez la quantité"
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label
                                            htmlFor="color"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Couleur
                                        </label>
                                        {selectedItem?.hasColors ? (
                                            <>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                        <select
                                            id="color"
                                                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                                            value={selectedColor}
                                                            onChange={(e) => {
                                                                setSelectedColor(e.target.value);
                                                                setIsNewColor(e.target.value === 'new');
                                                                if (e.target.value === 'new') {
                                                                    setNewColorName('');
                                                                    setNewColorQuantity(0);
                                                                }
                                                            }}
                                                            required
                                        >
                                            <option value="">Sélectionnez une couleur</option>
                                                            {selectedItem.colorStocks?.map((colorStock) => (
                                                <option key={colorStock.id} value={colorStock.color}>
                                                    {colorStock.color} ({colorStock.stockRestant} en stock)
                                                </option>
                                            ))}
                                            <option value="new">+ Nouvelle couleur</option>
                                        </select>
                                                    </div>

                                                    {isNewColor && (
                                                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                                            <div>
                                                                <label className="block text-sm text-gray-600 mb-1">
                                                                    Nom de la nouvelle couleur
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={newColorName}
                                                                    onChange={(e) => setNewColorName(e.target.value)}
                                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                                    placeholder="Ex: Rouge, Bleu, etc."
                                                                    required={isNewColor}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-gray-600 mb-1">
                                                                    Quantité initiale
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={newColorQuantity || ''}
                                                                    onChange={(e) => setNewColorQuantity(parseInt(e.target.value) || 0)}
                                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                                    placeholder="Quantité"
                                                                    min="0"
                                                                    required={isNewColor}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                Cet article ne gère pas les couleurs
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <label
                                            htmlFor="notes"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Notes (optionnel)
                                        </label>
                                        <textarea
                                            id="notes"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                                            rows={3}
                                            placeholder="Informations supplémentaires..."
                                            value={notes}
                                            onChange={(e) =>
                                                setNotes(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-b-xl">
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                            disabled={!selectedItemId || quantity <= 0 || (selectedItem?.hasColors && !selectedColor)}
                                        >
                                            <ArrowDown className="h-5 w-5 mr-2 text-emerald-100" />
                                            {loading
                                                ? "Ajout en cours..."
                                                : "Ajouter au stock"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmitNewItem}>
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Plus className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                Ajouter un nouvel article
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Créez un nouvel article dans l'inventaire
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-6">
                                        <label
                                            htmlFor="newItemName"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Nom de l'article
                                        </label>
                                        <input
                                            type="text"
                                            id="newItemName"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                            placeholder="Nom de l'article"
                                            value={newItemName}
                                            onChange={(e) =>
                                                setNewItemName(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label
                                            htmlFor="newItemReference"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Référence (optionnel)
                                        </label>
                                        <input
                                            type="text"
                                            id="newItemReference"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                            placeholder="Référence de l'article"
                                            value={newItemReference}
                                            onChange={(e) =>
                                                setNewItemReference(e.target.value)
                                            }
                                        />
                                        <p className="mt-2 text-sm text-gray-500">
                                            Si non renseignée, une référence sera générée automatiquement
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label
                                                htmlFor="newItemLocation"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Emplacement
                                            </label>
                                            <select
                                                id="newItemLocation"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
                                                <option value="Cotona">Cotona</option>
                                                <option value="Maison">Maison</option>
                                                <option value="Avishay">Avishay</option>
                                                <option value="Avenir">Avenir</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="newItemType"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Type
                                            </label>
                                            <div className="flex gap-2">
                                                <select
                                                    id="newItemType"
                                                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
                                                <button
                                                    type="button"
                                                    onClick={() => setIsTypeModalOpen(true)}
                                                    className="inline-flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Ajouter
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label
                                                htmlFor="newItemQuantity"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Quantité initiale
                                            </label>
                                            <input
                                                type="number"
                                                id="newItemQuantity"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                min="1"
                                                value={newItemQuantity || ''}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    setNewItemQuantity(isNaN(value) ? 0 : value);
                                                }}
                                                onBlur={() => {
                                                    if (newItemQuantity <= 0) {
                                                        setNewItemQuantity(0);
                                                    }
                                                }}
                                                required={!newItemHasColors}
                                                placeholder="Entrez la quantité initiale"
                                                disabled={newItemHasColors}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="newItemUnit"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Unité
                                            </label>
                                            <select
                                                id="newItemUnit"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                value={newItemUnit}
                                                onChange={(e) =>
                                                    setNewItemUnit(
                                                        e.target.value as
                                                            | "piece"
                                                            | "carton"
                                                            | "bal"
                                                    )
                                                }
                                            >
                                                <option value="piece">Pièce</option>
                                                <option value="carton">Carton</option>
                                                <option value="bal">Bal</option>
                                                                                    </select>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gestion des couleurs
                                    </label>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="hasColorsNo"
                                                name="hasColors"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                checked={!newItemHasColors}
                                                onChange={() => setNewItemHasColors(false)}
                                            />
                                            <label htmlFor="hasColorsNo" className="ml-2 block text-sm text-gray-600">
                                                Article sans gestion des couleurs
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="hasColorsYes"
                                                name="hasColors"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                checked={newItemHasColors}
                                                onChange={() => setNewItemHasColors(true)}
                                            />
                                            <label htmlFor="hasColorsYes" className="ml-2 block text-sm text-gray-600">
                                                Article avec gestion des couleurs
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {newItemHasColors && (
                                    <div className="mt-4 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-medium text-gray-700">Couleurs et stocks</h4>
                                            <button
                                                type="button"
                                                onClick={() => setColorStocks([...colorStocks, { color: '', stockInitial: 0 }])}
                                                className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Ajouter une couleur
                                            </button>
                                        </div>

                                        {colorStocks.map((stock, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-sm font-medium text-gray-700">Couleur {index + 1}</h5>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newStocks = [...colorStocks];
                                                            newStocks.splice(index, 1);
                                                            setColorStocks(newStocks);
                                                        }}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm text-gray-600 mb-1">
                                                            Nom de la couleur
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={stock.color}
                                                            onChange={(e) => {
                                                                const newStocks = [...colorStocks];
                                                                newStocks[index].color = e.target.value;
                                                                setColorStocks(newStocks);
                                                            }}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Ex: Rouge, Bleu, etc."
                                                            required={newItemHasColors}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-600 mb-1">
                                                            Stock initial
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={stock.stockInitial || ''}
                                                            onChange={(e) => {
                                                                const newStocks = [...colorStocks];
                                                                newStocks[index].stockInitial = parseInt(e.target.value) || 0;
                                                                setColorStocks(newStocks);
                                                            }}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Quantité"
                                                            min="0"
                                                            required={newItemHasColors}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {colorStocks.length === 0 && (
                                            <p className="text-sm text-gray-500 text-center py-4">
                                                Aucune couleur ajoutée. Cliquez sur "Ajouter une couleur" pour commencer.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-gray-50 rounded-b-xl">
                                <div className="flex justify-end">
                                    <button
                                            type="submit"
                                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                            disabled={!newItemName || !newItemType || (!newItemHasColors && newItemQuantity <= 0)}
                                        >
                                            <Plus className="h-5 w-5 mr-2 text-blue-100" />
                                            {loading
                                                ? "Création en cours..."
                                                : "Créer et ajouter"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Help sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Instructions
                            </h3>
                            {!newItemMode ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-medium text-sm">1</div>
                                        <p className="text-sm">Recherchez l'article dans le champ de recherche</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-medium text-sm">2</div>
                                        <p className="text-sm">Sélectionnez l'article dans la liste déroulante</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-medium text-sm">3</div>
                                        <p className="text-sm">Entrez la quantité à ajouter au stock</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-medium text-sm">4</div>
                                        <p className="text-sm">Ajoutez éventuellement des notes</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-medium text-sm">5</div>
                                        <p className="text-sm">Cliquez sur "Ajouter au stock" pour valider</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">1</div>
                                        <p className="text-sm">Entrez le nom du nouvel article</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">2</div>
                                        <p className="text-sm">Sélectionnez l'emplacement où l'article sera stocké</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">3</div>
                                        <p className="text-sm">Choisissez le type de l'article</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">4</div>
                                        <p className="text-sm">Définissez la quantité initiale en stock</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">5</div>
                                        <p className="text-sm">Sélectionnez l'unité de mesure</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">6</div>
                                        <p className="text-sm">Cliquez sur "Créer et ajouter" pour valider</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100/50 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/50 text-indigo-600 rounded-lg">
                                <Package className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-indigo-900">
                                Conseil
                            </h3>
                        </div>
                        <p className="text-sm text-indigo-700">
                            Pour un nouvel arrivage de produits existants, utilisez "Article existant". Pour ajouter un nouveau type de produit à votre catalogue, utilisez "Nouvel article".
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Type Modal */}
            {isTypeModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Ajouter un type d'article
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsTypeModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddType}>
                                <div className="mb-6">
                                    <label
                                        htmlFor="newTypeName"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Nom du type
                                    </label>
                                    <input
                                        type="text"
                                        id="newTypeName"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Entrez le nom du type"
                                        value={newTypeName}
                                        onChange={(e) => setNewTypeName(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsTypeModalOpen(false)}
                                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isSubmittingType}
                                    >
                                        {isSubmittingType ? "Création..." : "Créer le type"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
