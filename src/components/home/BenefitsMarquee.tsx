import { Truck, CreditCard, ShieldCheck, MessageCircle } from 'lucide-react';

const benefits = [
  { icon: Truck, title: 'FRETE EXPRESSO!', desc: 'Faça seu pedido hoje e receba em até 7 dias úteis!' },
  { icon: CreditCard, title: 'PARCELE EM ATÉ 12X', desc: 'Ou pague à vista no Pix!' },
  { icon: ShieldCheck, title: 'COMPRA SEGURA', desc: 'Site 100% seguro, garantimos a melhor experiência!' },
  { icon: MessageCircle, title: 'SUPORTE AO CLIENTE', desc: 'Estamos prontos para te atender!' },
];

export function BenefitsMarquee() {
  const items = [...benefits, ...benefits];

  return (
    <div className="w-full overflow-hidden bg-primary py-3">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((b, i) => (
          <div key={i} className="flex items-center gap-2 mx-8 md:mx-12 flex-shrink-0">
            <b.icon className="h-5 w-5 text-primary-foreground flex-shrink-0" />
            <span className="text-xs md:text-sm text-primary-foreground">
              <strong>{b.title}</strong>{' '}
              <span className="hidden sm:inline">{b.desc}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
