import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Leaf, TreePine, Flower2, Apple, Sprout,
  X, Star, Trash2, UserCircle, Plus, Minus, Edit3,
  CheckCircle, Loader2, Layers,
  FlaskConical, Bug, Truck, ShieldCheck, Store, Search,
  Package, ListOrdered, TrendingUp, Settings, BarChart3, Palette, Save, Upload
} from 'lucide-react';

// --- КОНСТАНТЫ И НАЧАЛЬНЫЕ ДАННЫЕ ---

const CATEGORIES = [
  { id: 'all', name: 'Все товары', icon: Leaf },
  { id: 'conifers', name: 'Хвойные', icon: TreePine },
  { id: 'flowers', name: 'Цветы и розы', icon: Flower2 },
  { id: 'fruits', name: 'Плодово-ягодные', icon: Apple },
  { id: 'shrubs', name: 'Декоративные кустарники', icon: Sprout },
  { id: 'soil', name: 'Грунт и мульча', icon: Layers },
  { id: 'chemicals', name: 'Препараты и удобрения', icon: FlaskConical },
  { id: 'designers', name: 'Ландшафтные дизайнеры', icon: Palette },
  { id: 'pest_control', name: 'Обработка участка', icon: Bug, isMonopoly: true },
  { id: 'planting', name: 'Доставка и посадка', icon: Truck, isMonopoly: true },
];

const RAW_PRODUCTS = [
  // Хвойные
  { name: 'Туя западная Смарагд (80-100 см)', price: 1500, category: 'conifers', nurseryId: 'n1' },
  { name: 'Можжевельник Минт Джулеп', price: 1850, category: 'conifers', nurseryId: 'n2' },
  { name: 'Ель колючая Глаука', price: 2500, category: 'conifers', nurseryId: 'n1' },

  // Цветы
  { name: 'Роза Эбрахам Дерби', price: 1200, category: 'flowers', nurseryId: 'n1' },
  { name: 'Пион Марьин корень', price: 950, category: 'flowers', nurseryId: 'n2' },
  { name: 'Тюльпан Сара Бернар (5шт)', price: 450, category: 'flowers', nurseryId: 'n1' },

  // Плодовые
  { name: 'Яблоня Антоновка', price: 800, category: 'fruits', nurseryId: 'n1' },
  { name: 'Груша Чижовская', price: 850, category: 'fruits', nurseryId: 'n2' },
  { name: 'Вишня Владимирская', price: 750, category: 'fruits', nurseryId: 'n1' },

  // Кустарники
  { name: 'Гортензия Ванилла Фрейз', price: 1350, category: 'shrubs', nurseryId: 'n1' },
  { name: 'Сирень Красавица Москвы', price: 1100, category: 'shrubs', nurseryId: 'n2' },
  { name: 'Спирея японская Литтл Принцесс', price: 650, category: 'shrubs', nurseryId: 'n1' },

  // Грунт
  { name: 'Грунт универсальный 50л', price: 600, category: 'soil', nurseryId: 'n1' },
  { name: 'Торф верховой кислый 50л', price: 550, category: 'soil', nurseryId: 'n2' },
  { name: 'Мульча из коры сосны 60л', price: 450, category: 'soil', nurseryId: 'n1' },

  // Химия
  { name: 'Удобрение Bona Forte', price: 350, category: 'chemicals', nurseryId: 'n1' },
  { name: 'Фитоспорин-М', price: 80, category: 'chemicals', nurseryId: 'n2' },
  { name: 'Эпин-Экстра', price: 50, category: 'chemicals', nurseryId: 'n1' },

  // Дизайнеры
  { name: 'Студия Эко-Дизайн (Проект)', price: 45000, category: 'designers', nurseryId: 'n1' },
  { name: 'Анна Смирнова (Экспресс-дизайн)', price: 15000, category: 'designers', nurseryId: 'n2' },
  { name: 'Иван Петров (Проект водоема)', price: 25000, category: 'designers', nurseryId: 'n1' }
];

const INITIAL_PRODUCTS = RAW_PRODUCTS.map((p, index) => ({
  id: index + 1,
  ...p,
  image: '' // Оставляем пустым, чтобы отображались красивые иконки категорий
}));

const NURSERIES = [
  { id: 'n1', name: 'Зелёный Сад', location: 'Московская область', rating: 4.8, type: 'Крупный питомник' },
  { id: 'n2', name: 'Хвойный Рай', location: 'Ленинградская область', rating: 4.9, type: 'Специализированный' },
];

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const ProductImage = ({ src, alt, category }) => {
  const [hasError, setHasError] = useState(false);
  const Icon = CATEGORIES.find(c => c.id === category)?.icon || Leaf;

  // Если ссылки нет или картинка не загрузилась — показываем серую заглушку с иконкой
  if (!src || hasError) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
        <Icon className="w-10 h-10 text-gray-300 mb-2" />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      onError={() => setHasError(true)} 
      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
    />
  );
};

export default function App() {
  // Меняем ключ localStorage на v3, чтобы сбросить старые 70 товаров и загрузить 21
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('agromarket_items_v3');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  
  // Состояния для Личного Кабинета
  const [currentSellerTab, setCurrentSellerTab] = useState('overview');
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Состояния оформления заказа
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [monopolyFormStatus, setMonopolyFormStatus] = useState('idle');
  const [monopolyPestTypes, setMonopolyPestTypes] = useState({ ticks: false, mosquitoes: false, pests: false, diseases: false });
  const [monopolyArea, setMonopolyArea] = useState('');
  
  // Услуги
  const [includeDelivery, setIncludeDelivery] = useState(true);
  const [includePlanting, setIncludePlanting] = useState(false);
  const [includePestControl, setIncludePestControl] = useState(false);
  const [pestControlTypes, setPestControlTypes] = useState({ ticks: false, mosquitoes: false, pests: false, diseases: false });
  const [pestControlArea, setPestControlArea] = useState('');
  const [calculatedDeliveryCost, setCalculatedDeliveryCost] = useState(null);
  const [deliveryDistance, setDeliveryDistance] = useState(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  // Данные клиента
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Сохранение в LocalStorage
  useEffect(() => {
    localStorage.setItem('agromarket_items_v3', JSON.stringify(products));
  }, [products]);

  // Фильтрация каталога
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      (selectedCategory === 'all' || p.category === selectedCategory) &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, selectedCategory, searchQuery]);

  const myProducts = products.filter(p => p.nurseryId === 'n1');

  // Расчеты
  const cartCount = cart.reduce((sum, item) => sum + item.q, 0);
  const onlinePaymentTotal = cart.reduce((sum, item) => sum + (item.price * item.q), 0);
  const deliveryCost = calculatedDeliveryCost || 0;
  const plantingCost = Math.round(onlinePaymentTotal * 0.3);
  
  let pestControlCost = 0;
  if (includePestControl) {
    const hasSelection = pestControlTypes.ticks || pestControlTypes.mosquitoes || pestControlTypes.pests || pestControlTypes.diseases;
    if (hasSelection) {
      pestControlCost += 1500;
      if (pestControlTypes.pests) pestControlCost += 2000;
      if (pestControlTypes.diseases) pestControlCost += 2000;
      const area = parseFloat(pestControlArea) || 0;
      if (pestControlTypes.ticks) pestControlCost += area * 250;
      if (pestControlTypes.mosquitoes) pestControlCost += area * 250;
    }
  }

  const onSitePaymentTotal = (includeDelivery ? deliveryCost : 0) + (includePlanting ? plantingCost : 0) + pestControlCost;
  const grandTotal = onlinePaymentTotal + onSitePaymentTotal;

  // Работа с корзиной
  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, q: i.q + 1} : i);
      return [...prev, {...p, q: 1}];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, q: item.q + delta } : item).filter(i => i.q > 0));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  // Работа с товарами (Панель продавца)
  const handleSaveProduct = (e) => {
    e.preventDefault();
    setProducts(prev => {
      const exists = prev.find(p => p.id === editingProduct.id);
      if (exists) {
        return prev.map(p => p.id === editingProduct.id ? editingProduct : p);
      } else {
        return [editingProduct, ...prev];
      }
    });
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({...editingProduct, image: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  // Логика оформления заказа
  const calculateDelivery = () => {
    if (!customerAddress || cart.length === 0) return;
    setIsCalculatingDelivery(true);
    setTimeout(() => {
        const uniqueNurseries = [...new Set(cart.map(item => item.nurseryId))].filter(Boolean);
        const nurseryCount = uniqueNurseries.length || 1;
        const mockDistance = (customerAddress.length * 5) % 70 + 15; 
        const totalDistance = mockDistance * nurseryCount;
        const cost = (nurseryCount * 500) + (totalDistance * 40);
        
        setDeliveryDistance(totalDistance);
        setCalculatedDeliveryCost(cost);
        setIsCalculatingDelivery(false);
    }, 1500);
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (includeDelivery && calculatedDeliveryCost === null) {
      calculateDelivery(); 
      return;
    }
    setCheckoutStep('payment');
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutStep('success');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setDeliveryDate('');
      setIncludeDelivery(true);
      setIncludePlanting(false);
      setIncludePestControl(false);
      setPestControlTypes({ ticks: false, mosquitoes: false, pests: false, diseases: false });
      setPestControlArea('');
      setCalculatedDeliveryCost(null);
      setDeliveryDistance(null);
    }, 2000);
  };

  const mockOrders = [
    { id: 'ORD-841', date: 'Сегодня, 14:30', client: 'Иван Петров', amount: 3200, status: 'Новый' },
    { id: 'ORD-839', date: 'Вчера, 09:15', client: 'Анна Сергеева', amount: 8500, status: 'В доставке' },
    { id: 'ORD-830', date: '25 апр, 18:00', client: 'ООО "Ландшафт"', amount: 45000, status: 'Выполнен' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Новый': return 'bg-red-100 text-red-700';
      case 'В доставке': return 'bg-blue-100 text-blue-700';
      case 'Выполнен': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderMonopolyPage = (cat) => (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
      <div className="flex-1 p-8 md:p-12 bg-blue-50/50">
        <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
          {cat.id === 'pest_control' ? <Bug className="w-7 h-7" /> : <Truck className="w-7 h-7" />}
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">{cat.name}</h2>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Фирменная услуга от АгроМаркет. Мы гарантируем результат, используем профессиональное оборудование и несем полную ответственность за ваш сад.
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-3 font-semibold text-gray-800">
            <ShieldCheck className="text-blue-600 w-6 h-6" /> Гарантия по договору
          </div>
          <div className="flex items-center gap-3 font-semibold text-gray-800">
            <ShieldCheck className="text-blue-600 w-6 h-6" /> Специалисты с опытом
          </div>
        </div>
      </div>
      <div className="w-full md:w-[400px] p-8 md:p-12 flex items-center bg-white border-l border-gray-50">
        {monopolyFormStatus === 'idle' ? (
          <form onSubmit={(e) => { e.preventDefault(); setMonopolyFormStatus('submitted'); }} className="w-full space-y-4">
            <h4 className="font-bold text-xl text-gray-900 mb-2">Заявка на расчет</h4>
            <div className="space-y-4">
              <input required placeholder="Ваше имя" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" />
              <input required type="tel" placeholder="Телефон" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" />
              
              {cat.id === 'pest_control' && (
                <div className="space-y-3 mb-4 bg-white p-4 rounded-2xl border border-gray-200">
                  <p className="font-bold text-sm text-gray-800">Что будем обрабатывать?</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2 accent-blue-600 w-4 h-4" checked={monopolyPestTypes.ticks} onChange={e => setMonopolyPestTypes({...monopolyPestTypes, ticks: e.target.checked})}/> Клещи
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2 accent-blue-600 w-4 h-4" checked={monopolyPestTypes.mosquitoes} onChange={e => setMonopolyPestTypes({...monopolyPestTypes, mosquitoes: e.target.checked})}/> Комары
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2 accent-blue-600 w-4 h-4" checked={monopolyPestTypes.pests} onChange={e => setMonopolyPestTypes({...monopolyPestTypes, pests: e.target.checked})}/> Вредители
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2 accent-blue-600 w-4 h-4" checked={monopolyPestTypes.diseases} onChange={e => setMonopolyPestTypes({...monopolyPestTypes, diseases: e.target.checked})}/> Болезни
                    </label>
                  </div>
                </div>
              )}

              {(cat.id === 'planting' || (cat.id === 'pest_control' && (monopolyPestTypes.ticks || monopolyPestTypes.mosquitoes))) && (
                <input 
                  required={cat.id === 'pest_control' && (monopolyPestTypes.ticks || monopolyPestTypes.mosquitoes)} 
                  type={cat.id === 'pest_control' ? "number" : "text"} 
                  min="1" 
                  placeholder={cat.id === 'pest_control' ? "Площадь участка (в сотках)" : "Площадь участка / Описание"} 
                  value={monopolyArea} 
                  onChange={e => setMonopolyArea(e.target.value)} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" 
                />
              )}

            </div>
            <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
              Получить расчет
            </button>
          </form>
        ) : (
          <div className="text-center w-full py-10">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h4 className="text-2xl font-black text-gray-900 mb-2">Заявка принята!</h4>
            <p className="text-gray-500">Мы перезвоним вам через 15 минут.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => {setActiveTab('catalog'); setSelectedCategory('all');}}>
            <div className="bg-green-600 text-white p-1.5 rounded-lg shadow-md shadow-green-100"><Leaf className="w-6 h-6" /></div>
            <span className="text-xl font-black tracking-tight text-green-800 hidden lg:inline">АгроМаркет</span>
          </div>

          <div className="flex-1 max-w-lg relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Поиск по каталогу..." 
              value={searchQuery}
              onChange={(e) => {setSearchQuery(e.target.value); setActiveTab('catalog');}}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
            />
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-bold text-gray-500 flex-shrink-0">
            <button onClick={() => setActiveTab('catalog')} className={activeTab === 'catalog' ? 'text-green-600' : 'hover:text-gray-900'}>Каталог</button>
            <button onClick={() => setActiveTab('nurseries')} className={activeTab === 'nurseries' ? 'text-green-600' : 'hover:text-gray-900'}>Питомники</button>
            <button onClick={() => setActiveTab('seller')} className={`flex items-center gap-1.5 transition-colors ${activeTab === 'seller' ? 'text-green-600' : 'hover:text-gray-900'}`}><UserCircle className="w-4 h-4"/> Мой магазин</button>
          </nav>

          <button onClick={() => setIsCheckoutOpen(true)} className="relative p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all active:scale-95 flex-shrink-0">
            <ShoppingCart className="w-6 h-6 text-gray-700"/>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {activeTab === 'catalog' && (
          <>
            <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base">
                  <Layers className="w-5 h-5 text-green-600" /> Категории
                </h3>
                <div className="space-y-1">
                  {CATEGORIES.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => {setSelectedCategory(c.id); setMonopolyFormStatus('idle'); setSearchQuery('');}}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${selectedCategory === c.id ? 'bg-green-600 text-white font-bold shadow-lg shadow-green-100' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <c.icon className={`w-4 h-4 flex-shrink-0 ${selectedCategory === c.id ? 'text-white' : 'text-gray-400 group-hover:text-green-600'}`} />
                      <span className="flex-1 leading-tight">{c.name}</span>
                      {c.isMonopoly && <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedCategory === c.id ? 'bg-white' : 'bg-blue-400'}`} />}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {searchQuery ? `Поиск: ${searchQuery}` : (CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Каталог')}
                </h1>
              </div>

              {CATEGORIES.find(c => c.id === selectedCategory)?.isMonopoly && !searchQuery ? (
                renderMonopolyPage(CATEGORIES.find(c => c.id === selectedCategory))
              ) : (
                <>
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                       <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                       <h3 className="text-xl font-bold text-gray-900 mb-2">Ничего не найдено</h3>
                       <p className="text-gray-500">Попробуйте изменить поисковый запрос или выбрать другую категорию.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map(p => (
                        <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
                          <div className="h-48 relative overflow-hidden bg-gray-50">
                            <ProductImage src={p.image} alt={p.name} category={p.category} />
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-gray-900 mb-4 h-10 line-clamp-2 leading-tight">{p.name}</h3>
                            <div className="mt-auto flex justify-between items-center">
                              <span className="text-xl font-black text-gray-900">{p.price.toLocaleString()} ₽</span>
                              <button onClick={() => addToCart(p)} className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 active:scale-95 transition-all">
                                <Plus className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {activeTab === 'nurseries' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {NURSERIES.map(n => (
              <div key={n.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6"><Store className="w-8 h-8" /></div>
                <h3 className="text-xl font-black mb-1">{n.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{n.location}</p>
                <div className="flex items-center gap-1 text-yellow-500 font-bold mb-8"><Star className="w-4 h-4 fill-current"/> {n.rating}</div>
                <button onClick={() => setActiveTab('catalog')} className="w-full py-4 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-gray-100">Смотреть товары</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'seller' && (
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div className="w-full lg:w-72 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm h-fit shrink-0">
              <div className="flex items-center gap-4 mb-6 p-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-black text-xl shrink-0">ЗС</div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">Зелёный Сад</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Московская область</p>
                </div>
              </div>
              <nav className="space-y-1.5">
                <button onClick={() => setCurrentSellerTab('overview')} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all ${currentSellerTab === 'overview' ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                  <BarChart3 className="w-5 h-5"/> Сводка
                </button>
                <button onClick={() => setCurrentSellerTab('products')} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all ${currentSellerTab === 'products' ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                  <Package className="w-5 h-5"/> Мои товары
                </button>
                <button onClick={() => setCurrentSellerTab('orders')} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all ${currentSellerTab === 'orders' ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                  <ListOrdered className="w-5 h-5"/> Заказы
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">1</span>
                </button>
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-gray-500 hover:bg-gray-50 transition-all font-medium">
                    <Settings className="w-5 h-5"/> Настройки магазина
                  </button>
                </div>
              </nav>
            </div>
            
            <div className="flex-1 bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {currentSellerTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black text-gray-900 mb-6">Сводка за месяц</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="text-gray-500 text-sm mb-3 flex items-center gap-2 font-medium"><TrendingUp className="w-4 h-4 text-green-500"/> Выручка</div>
                      <div className="text-3xl font-black text-gray-900">128 400 ₽</div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="text-gray-500 text-sm mb-3 flex items-center gap-2 font-medium"><ListOrdered className="w-4 h-4 text-blue-500"/> Заказы</div>
                      <div className="text-3xl font-black text-gray-900">14 <span className="text-sm font-medium text-gray-400 ml-1">шт.</span></div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="text-gray-500 text-sm mb-3 flex items-center gap-2 font-medium"><Package className="w-4 h-4 text-orange-500"/> Товары</div>
                      <div className="text-3xl font-black text-gray-900">{myProducts.length} <span className="text-sm font-medium text-gray-400 ml-1">активных</span></div>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Последние действия</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                      <div className="flex-1"><span className="font-bold text-gray-900">Новый заказ ORD-841</span> на сумму 3 200 ₽</div>
                      <div className="text-sm font-medium text-gray-400">2 часа назад</div>
                    </div>
                    <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 text-gray-600">Заказ ORD-839 переведен в статус <span className="font-bold text-gray-900">«В доставке»</span></div>
                      <div className="text-sm font-medium text-gray-400">Вчера</div>
                    </div>
                  </div>
                </div>
              )}

              {currentSellerTab === 'products' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black text-gray-900">Мои товары</h2>
                    <button 
                      onClick={() => setEditingProduct({ id: Date.now(), name: '', price: 0, category: 'conifers', nurseryId: 'n1', image: '' })}
                      className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-100 active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Добавить товар
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-gray-100 text-gray-400 text-sm">
                          <th className="pb-4 font-medium">Товар</th>
                          <th className="pb-4 font-medium">Категория</th>
                          <th className="pb-4 font-medium">Цена</th>
                          <th className="pb-4 font-medium text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {myProducts.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="py-4 flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                <ProductImage src={p.image} alt={p.name} category={p.category} />
                              </div>
                              <span className="font-bold text-gray-900 line-clamp-2 max-w-[250px]">{p.name}</span>
                            </td>
                            <td className="py-4 text-gray-500 text-sm">
                              {CATEGORIES.find(c => c.id === p.category)?.name}
                            </td>
                            <td className="py-4 font-black text-gray-900 whitespace-nowrap">{p.price.toLocaleString()} ₽</td>
                            <td className="py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingProduct({...p})} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {currentSellerTab === 'orders' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black text-gray-900 mb-8">Заказы клиентов</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-sm">
                          <th className="pb-4 font-medium">Номер</th>
                          <th className="pb-4 font-medium">Дата</th>
                          <th className="pb-4 font-medium">Клиент</th>
                          <th className="pb-4 font-medium">Сумма</th>
                          <th className="pb-4 font-medium">Статус</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {mockOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                            <td className="py-4 font-bold text-gray-900">{order.id}</td>
                            <td className="py-4 text-gray-500 text-sm">{order.date}</td>
                            <td className="py-4 text-gray-900 font-medium">{order.client}</td>
                            <td className="py-4 font-black text-gray-900 whitespace-nowrap">{order.amount.toLocaleString()} ₽</td>
                            <td className="py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* МОДАЛКА РЕДАКТИРОВАНИЯ И ДОБАВЛЕНИЯ ТОВАРА */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black tracking-tight text-gray-900">
                {editingProduct.name ? 'Редактировать товар' : 'Новый товар'}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X /></button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Название товара</label>
                <input 
                  required
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-green-500 transition-all font-bold text-sm"
                  placeholder="Например: Туя Смарагд"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Цена (₽)</label>
                  <input 
                    type="number"
                    required
                    value={editingProduct.price || ''}
                    onChange={e => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-green-500 transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Категория</label>
                  <select 
                    value={editingProduct.category}
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-green-500 transition-all font-bold text-sm appearance-none cursor-pointer"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all' && !c.isMonopoly).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Изображение товара</label>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-2xl border border-gray-200 overflow-hidden shrink-0 bg-gray-50">
                    <ProductImage src={editingProduct.image} alt="preview" category={editingProduct.category} />
                  </div>
                  <div className="flex-1 flex flex-col gap-2 justify-center">
                    
                    <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 bg-green-50 text-green-700 font-bold text-sm rounded-xl border border-green-200 hover:bg-green-100 transition-colors">
                      <Upload className="w-4 h-4" /> Загрузить файл
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    
                    <div className="flex items-center gap-2">
                       <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest w-full text-center">— или вставьте ссылку —</span>
                    </div>
                    
                    <input 
                      placeholder="https://... или /images/..."
                      value={editingProduct.image}
                      onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-all text-xs font-mono text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Save className="w-5 h-5" /> Сохранить
              </button>
            </form>
          </div>
        </div>
      )}

      {/* КОРЗИНА И ОФОРМЛЕНИЕ */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-sm">
            {checkoutStep !== 'success' && (
              <button onClick={() => setIsCheckoutOpen(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 p-2"><X className="w-6 h-6" /></button>
            )}
            
            {checkoutStep === 'details' && (
              <form onSubmit={handleProceedToPayment}>
                <h3 className="text-2xl font-black mb-6 tracking-tight">Ваш заказ</h3>
                
                <div className="space-y-4 mb-8">
                  {cart.length === 0 ? (
                    <div className="text-center py-10">
                      <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400">В корзине пока пусто</p>
                    </div>
                  ) : (
                    cart.map(i => (
                      <div key={i.id} className="flex justify-between items-center border-b border-gray-50 pb-4">
                        <div className="flex-1 pr-4">
                          <div className="font-bold text-gray-900 leading-tight text-sm">{i.name}</div>
                          <div className="flex items-center gap-3 mt-2.5">
                             <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                               <button type="button" onClick={() => updateQuantity(i.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"><Minus className="w-3 h-3"/></button>
                               <span className="w-8 text-center text-xs font-bold text-gray-900">{i.q}</span>
                               <button type="button" onClick={() => updateQuantity(i.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"><Plus className="w-3 h-3"/></button>
                             </div>
                             <span className="text-gray-400 text-xs font-medium">x {i.price.toLocaleString()} ₽</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-black text-base text-gray-900 whitespace-nowrap">{(i.price * i.q).toLocaleString()} ₽</span>
                          <button type="button" onClick={() => removeFromCart(i.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <>
                    <h4 className="font-bold text-gray-900 mb-3">Дополнительные услуги (Оплата на месте):</h4>
                    <div className="space-y-3 mb-8">
                      <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all ${includeDelivery ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <input type="checkbox" checked={includeDelivery} onChange={e => {
                            setIncludeDelivery(e.target.checked);
                            if (!e.target.checked) {
                              setCalculatedDeliveryCost(null);
                              setDeliveryDistance(null);
                            }
                          }} className="w-4 h-4 mt-1 accent-green-600" />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <b>Доставка с питомника</b> 
                            <span className="font-bold text-gray-900">
                              {calculatedDeliveryCost !== null ? `+${calculatedDeliveryCost.toLocaleString()} ₽` : (includeDelivery ? 'Рассчитывается...' : '+0 ₽')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {deliveryDistance ? `Расстояние: ~${deliveryDistance} км` : 'Зависит от расстояния до адреса'}
                          </p>
                        </div>
                      </label>
                      
                      <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all ${includePlanting ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <input type="checkbox" checked={includePlanting} onChange={e => setIncludePlanting(e.target.checked)} className="w-4 h-4 mt-1 accent-green-600" />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <b>Посадка на участке</b> 
                            <span className="font-bold text-gray-900">+{plantingCost.toLocaleString()} ₽</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Расчет 30% от суммы. Гарантия приживаемости 1 год.</p>
                          {includePlanting && includeDelivery && deliveryDate && (
                            <p className="text-xs text-green-600 font-bold mt-1">Забронировано на дату доставки: {deliveryDate}</p>
                          )}
                        </div>
                      </label>

                      <div className={`border rounded-2xl transition-all overflow-hidden ${includePestControl ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <label className="flex items-start p-4 cursor-pointer">
                          <input type="checkbox" checked={includePestControl} onChange={e => {
                              setIncludePestControl(e.target.checked);
                              if (!e.target.checked) {
                                setPestControlTypes({ ticks: false, mosquitoes: false, pests: false, diseases: false });
                                setPestControlArea('');
                              }
                            }} className="w-4 h-4 mt-1 accent-green-600" />
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <b>Обработка от вредителей</b> 
                              <span className="font-bold text-gray-900">
                                {includePestControl ? `+${pestControlCost.toLocaleString()} ₽` : 'от 1 500 ₽'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Профессиональная защита от вредителей и болезней.</p>
                          </div>
                        </label>

                        {includePestControl && (
                          <div className="px-4 pb-4 pt-2 border-t border-green-200 ml-10 space-y-3">
                            <p className="text-sm font-bold text-gray-800">Выберите тип обработки:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <label className="flex items-center text-sm cursor-pointer">
                                <input type="checkbox" className="mr-2 accent-green-600 w-4 h-4" checked={pestControlTypes.ticks} onChange={e => setPestControlTypes({...pestControlTypes, ticks: e.target.checked})}/> Клещи
                              </label>
                              <label className="flex items-center text-sm cursor-pointer">
                                <input type="checkbox" className="mr-2 accent-green-600 w-4 h-4" checked={pestControlTypes.mosquitoes} onChange={e => setPestControlTypes({...pestControlTypes, mosquitoes: e.target.checked})}/> Комары
                              </label>
                              <label className="flex items-center text-sm cursor-pointer">
                                <input type="checkbox" className="mr-2 accent-green-600 w-4 h-4" checked={pestControlTypes.pests} onChange={e => setPestControlTypes({...pestControlTypes, pests: e.target.checked})}/> Садовые вредители
                              </label>
                              <label className="flex items-center text-sm cursor-pointer">
                                <input type="checkbox" className="mr-2 accent-green-600 w-4 h-4" checked={pestControlTypes.diseases} onChange={e => setPestControlTypes({...pestControlTypes, diseases: e.target.checked})}/> Болезни растений
                              </label>
                            </div>
                            {(pestControlTypes.ticks || pestControlTypes.mosquitoes) && (
                              <div className="mt-3">
                                <input 
                                  type="number" 
                                  min="1" 
                                  placeholder="Площадь участка (в сотках)" 
                                  value={pestControlArea} 
                                  onChange={e => setPestControlArea(e.target.value)} 
                                  className="w-full p-3 bg-white border border-green-300 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm" 
                                  required 
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-gray-900 mb-3">Данные получателя:</h4>
                    <div className="space-y-3 mb-8">
                      <input 
                        required 
                        value={customerName} 
                        onChange={e => setCustomerName(e.target.value)} 
                        placeholder="Ваши Имя и Фамилия" 
                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" 
                      />
                      <input 
                        required 
                        type="tel" 
                        value={customerPhone} 
                        onChange={e => setCustomerPhone(e.target.value)} 
                        placeholder="Номер телефона" 
                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" 
                      />
                      {(includeDelivery || includePlanting || includePestControl) && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input 
                            required 
                            value={customerAddress} 
                            onChange={e => {
                              setCustomerAddress(e.target.value);
                              setCalculatedDeliveryCost(null);
                            }} 
                            placeholder="Адрес вашего участка" 
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" 
                          />
                          <button 
                            type="button"
                            onClick={calculateDelivery}
                            disabled={!customerAddress || isCalculatingDelivery || (!includeDelivery)}
                            className={`px-6 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${includeDelivery ? 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                          >
                            {isCalculatingDelivery ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Рассчитать'}
                          </button>
                        </div>
                      )}

                      {includeDelivery && (
                        <div className="pt-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Желаемая дата доставки</label>
                          <input 
                            required 
                            type="date" 
                            value={deliveryDate} 
                            onChange={e => setDeliveryDate(e.target.value)} 
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-gray-100 mb-6 space-y-3">
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-600">Товары (оплата онлайн сейчас):</span>
                        <span className="font-bold text-gray-900">{onlinePaymentTotal.toLocaleString()} ₽</span>
                      </div>
                      
                      {(includeDelivery || includePlanting || includePestControl) && (
                        <div className="flex justify-between items-center text-lg">
                          <span className="text-gray-600">Услуги (оплата на месте специалисту):</span>
                          <span className="font-bold text-orange-600">{onSitePaymentTotal.toLocaleString()} ₽</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-2xl font-black pt-4 border-t border-gray-50 mt-2">
                        <span>Общая сумма заказа:</span>
                        <span className="text-green-700">{grandTotal.toLocaleString()} ₽</span>
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={includeDelivery && calculatedDeliveryCost === null}
                      className="w-full py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {includeDelivery && calculatedDeliveryCost === null ? 'Сначала рассчитайте доставку' : 'Перейти к оплате товаров'}
                    </button>
                  </>
                )}
              </form>
            )}

            {checkoutStep === 'payment' && (
              <div className="text-center py-4">
                <button onClick={() => setCheckoutStep('details')} className="absolute left-6 top-6 text-sm font-bold text-gray-400 hover:text-gray-600">Назад</button>
                <h3 className="text-2xl font-black mb-6">Оплата картой</h3>
                <div className="w-full aspect-[1.6/1] bg-gradient-to-tr from-gray-900 to-gray-800 rounded-2xl mb-8 flex flex-col justify-end p-6 text-white text-left shadow-xl">
                  <div className="font-mono text-xl tracking-widest opacity-50 mb-2">•••• •••• •••• ••••</div>
                  <div className="flex justify-between opacity-50 text-xs">
                    <span>MM/YY</span>
                    <span>CVC</span>
                  </div>
                </div>
                
                <button onClick={handlePayment} disabled={isProcessing} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black flex justify-center items-center gap-2 shadow-xl shadow-green-100 hover:bg-green-700 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : `Оплатить онлайн ${onlinePaymentTotal.toLocaleString()} ₽`}
                </button>
                
                {onSitePaymentTotal > 0 && (
                   <p className="text-gray-500 text-xs mt-4 leading-relaxed">
                     *Оставшаяся сумма за услуги ({onSitePaymentTotal.toLocaleString()} ₽) оплачивается наличными или переводом специалистам после выполнения работ.
                   </p>
                )}
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Заказ оплачен!</h3>
                <p className="text-gray-500 mb-6 leading-relaxed text-base">Ваш заказ успешно оформлен и передан в питомники.</p>
                
                <div className="bg-gray-50 p-4 rounded-xl text-left mb-8 text-sm">
                  <div className="flex items-center gap-2 font-bold mb-2 text-gray-800"><Truck className="w-4 h-4"/> Ожидайте доставку</div>
                  <p className="text-gray-600">
                    {includeDelivery && deliveryDate 
                      ? <>Ваш заказ зарезервирован на <b>{deliveryDate}</b>. Мы свяжемся с вами по номеру <span className="font-medium text-gray-900">{customerPhone}</span> для подтверждения и согласования точного времени прибытия.</>
                      : <>Мы свяжемся с вами по номеру <span className="font-medium text-gray-900">{customerPhone}</span> для уточнения времени прибытия машины и бригады специалистов.</>
                    }
                  </p>
                </div>

                <button onClick={() => {setIsCheckoutOpen(false); setCheckoutStep('details');}} className="w-full py-4 bg-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-200 transition-all">
                  Вернуться в каталог
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
