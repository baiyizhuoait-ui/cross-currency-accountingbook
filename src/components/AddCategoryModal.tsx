import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Utensils, Car, ShoppingBag, Home, Gamepad2, HeartPulse, BookOpen, Sparkles, Smartphone, Shirt,
  Wine, Package, Plane, Music, Dog, Briefcase, Gift, CreditCard, Wrench, Coffee,
  Bike, Bus, Train, Fuel, Wifi, Tv, Camera, Umbrella, Dumbbell, Scissors,
  Baby, GraduationCap, Stethoscope, Pill, Apple, Cake, Pizza, IceCream, Salad, Egg,
  Leaf, Flower2, Trees, Mountain, Tent, Anchor, Fish, Bird, Cat, Rabbit,
  Palette, Paintbrush, PenTool, Laptop, Monitor, Printer, Headphones, Speaker, Watch, Gem
} from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; icon: string; color: string }) => void;
}

const ICON_OPTIONS = [
  { icon: Utensils, name: 'Utensils', label: '餐饮' },
  { icon: Car, name: 'Car', label: '汽车' },
  { icon: ShoppingBag, name: 'ShoppingBag', label: '购物' },
  { icon: Home, name: 'Home', label: '住房' },
  { icon: Gamepad2, name: 'Gamepad2', label: '游戏' },
  { icon: HeartPulse, name: 'HeartPulse', label: '健康' },
  { icon: BookOpen, name: 'BookOpen', label: '教育' },
  { icon: Sparkles, name: 'Sparkles', label: '美容' },
  { icon: Smartphone, name: 'Smartphone', label: '手机' },
  { icon: Shirt, name: 'Shirt', label: '服饰' },
  { icon: Wine, name: 'Wine', label: '酒水' },
  { icon: Package, name: 'Package', label: '快递' },
  { icon: Plane, name: 'Plane', label: '旅行' },
  { icon: Music, name: 'Music', label: '音乐' },
  { icon: Dog, name: 'Dog', label: '宠物' },
  { icon: Briefcase, name: 'Briefcase', label: '商务' },
  { icon: Gift, name: 'Gift', label: '礼物' },
  { icon: CreditCard, name: 'CreditCard', label: '支付' },
  { icon: Wrench, name: 'Wrench', label: '维修' },
  { icon: Coffee, name: 'Coffee', label: '咖啡' },
  { icon: Bike, name: 'Bike', label: '自行车' },
  { icon: Bus, name: 'Bus', label: '公交' },
  { icon: Train, name: 'Train', label: '火车' },
  { icon: Fuel, name: 'Fuel', label: '加油' },
  { icon: Wifi, name: 'Wifi', label: '网络' },
  { icon: Tv, name: 'Tv', label: '电视' },
  { icon: Camera, name: 'Camera', label: '摄影' },
  { icon: Umbrella, name: 'Umbrella', label: '雨伞' },
  { icon: Dumbbell, name: 'Dumbbell', label: '健身' },
  { icon: Scissors, name: 'Scissors', label: '理发' },
  { icon: Baby, name: 'Baby', label: '母婴' },
  { icon: GraduationCap, name: 'GraduationCap', label: '学业' },
  { icon: Stethoscope, name: 'Stethoscope', label: '医疗' },
  { icon: Pill, name: 'Pill', label: '药品' },
  { icon: Apple, name: 'Apple', label: '水果' },
  { icon: Cake, name: 'Cake', label: '蛋糕' },
  { icon: Pizza, name: 'Pizza', label: '外卖' },
  { icon: IceCream, name: 'IceCream', label: '甜品' },
  { icon: Salad, name: 'Salad', label: '沙拉' },
  { icon: Egg, name: 'Egg', label: '食材' },
  { icon: Leaf, name: 'Leaf', label: '绿植' },
  { icon: Flower2, name: 'Flower2', label: '鲜花' },
  { icon: Trees, name: 'Trees', label: '户外' },
  { icon: Mountain, name: 'Mountain', label: '登山' },
  { icon: Tent, name: 'Tent', label: '露营' },
  { icon: Anchor, name: 'Anchor', label: '航海' },
  { icon: Fish, name: 'Fish', label: '钓鱼' },
  { icon: Bird, name: 'Bird', label: '鸟类' },
  { icon: Cat, name: 'Cat', label: '猫咪' },
  { icon: Rabbit, name: 'Rabbit', label: '兔子' },
  { icon: Palette, name: 'Palette', label: '画板' },
  { icon: Paintbrush, name: 'Paintbrush', label: '绘画' },
  { icon: PenTool, name: 'PenTool', label: '设计' },
  { icon: Laptop, name: 'Laptop', label: '电脑' },
  { icon: Monitor, name: 'Monitor', label: '显示器' },
  { icon: Printer, name: 'Printer', label: '打印' },
  { icon: Headphones, name: 'Headphones', label: '耳机' },
  { icon: Speaker, name: 'Speaker', label: '音响' },
  { icon: Watch, name: 'Watch', label: '手表' },
  { icon: Gem, name: 'Gem', label: '珠宝' },
];

const COLOR_OPTIONS = [
  '#f97316', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4',
  '#ef4444', '#14b8a6', '#a3e635', '#6366f1', '#f43f5e',
  '#fbbf24', '#78716c', '#1677ff', '#07c160', '#0ea5e9',
  '#d946ef', '#f59e0b', '#10b981', '#64748b', '#be123c',
];

export default function AddCategoryModal({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Utensils');
  const [color, setColor] = useState('#3b82f6');

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    // Render the icon as a colored SVG reference stored as icon name
    // We'll use the icon name and render it with the color in the app
    onAdd({ name: name.trim(), icon: selectedIcon, color });
    setName('');
    setSelectedIcon('Utensils');
    setColor('#3b82f6');
  };

  const SelectedIconComponent = ICON_OPTIONS.find(i => i.name === selectedIcon)?.icon || Package;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-md max-h-[90vh] overflow-auto glass-card rounded-t-3xl sm:rounded-3xl modal-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">新建分类</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex items-center justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
            <SelectedIconComponent className="w-8 h-8" style={{ color }} />
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1 block">分类名称</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="输入分类名称"
            className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>

        {/* Icon grid */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-2 block">选择图标</label>
          <div className="grid grid-cols-8 gap-1.5 max-h-[180px] overflow-auto">
            {ICON_OPTIONS.map(({ icon: Icon, name: iconName, label }) => (
              <button
                key={iconName}
                onClick={() => setSelectedIcon(iconName)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  selectedIcon === iconName
                    ? 'ring-2 ring-primary bg-primary/10'
                    : 'bg-secondary hover:bg-muted'
                }`}
                title={label}
              >
                <Icon className="w-4.5 h-4.5" style={{ color: selectedIcon === iconName ? color : undefined }} />
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="mb-6">
          <label className="text-xs text-muted-foreground mb-2 block">选择颜色</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full gradient-primary text-primary-foreground py-3 rounded-2xl font-semibold accent-glow transition-all duration-200 hover:opacity-90"
        >
          创建分类
        </button>
      </div>
    </div>
  );
}

// Export the ICON_OPTIONS for use in rendering categories
export { ICON_OPTIONS };
