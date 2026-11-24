"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { fmtWeekday, hash } from '@/lib/format';
import type { Product } from '@/lib/types';
import { Art } from '@/components/common/Art';
import { Stars } from '@/components/common/bits';
import { Icon } from '@/components/common/Icon';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { productDescId, useProductName, useText } from '@/components/demo/Txt';

const VIEWS = 4;
const AUTOPLAY_MS = 4500;

export function Gallery({ product: p, view, onView }: { product: Product; view: number; onView: (i: number) => void }) {
  const name = useProductName(p.id, p.name);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [full, setFull] = useState(false);
  const fsRef = useRef<HTMLDivElement>(null);
  const go = (n: number) => onView((n + VIEWS) % VIEWS);

  useFocusTrap(fsRef, full, () => setFull(false));
  useBodyScrollLock(full);

  // Cycles through the views on its own; pauses while the shopper is hovering, zooming or
  // looking at the full-screen viewer, so it never fights with what they're doing.
  useEffect(() => {
    if (full || zoom) return;
    const t = setTimeout(() => onView((view + 1) % VIEWS), AUTOPLAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, full, zoom]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(view + 1);
      if (e.key === 'ArrowLeft') go(view - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full, view]);

  return (
    <div>
      <div
        className="gmain"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <div className="g-zoom" style={zoom ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} onClick={() => setFull(true)} role="button" tabIndex={0} aria-label={`View ${name} full screen`} onKeyDown={(e) => e.key === 'Enter' && setFull(true)}>
          <Art id={p.id} emoji={p.emoji} name={name} image={p.image} view={view} sizes="(max-width: 860px) 100vw, 560px" priority />
        </div>
        {zoom && (
          <span className="g-hint">
            <Icon name="search" size={14} /> Click to zoom
          </span>
        )}
        <button type="button" className="g-arrow l" aria-label="Previous image" onClick={() => go(view - 1)}>
          <Icon name="chevronLeft" />
        </button>
        <button type="button" className="g-arrow r" aria-label="Next image" onClick={() => go(view + 1)}>
          <Icon name="chevronRight" />
        </button>
      </div>
      <div className="thumbs" role="group" aria-label="Product views">
        {Array.from({ length: VIEWS }, (_, i) => (
          <button key={i} type="button" className={`thumb${view === i ? ' on' : ''}`} aria-label={`View ${i + 1}`} aria-pressed={view === i} onClick={() => onView(i)}>
            <Art id={p.id} emoji={p.emoji} name="" image={p.image} view={i} sizes="120px" />
          </button>
        ))}
      </div>
      {full && (
        <div className="g-fs" ref={fsRef} role="dialog" aria-modal="true" aria-label={`${name} image viewer`} tabIndex={-1} data-no-capture>
          <div className="g-fs-bar">
            <p>
              {name} · {view + 1} / {VIEWS}
            </p>
            <button type="button" data-autofocus aria-label="Close image viewer" onClick={() => setFull(false)}>
              <Icon name="x" />
            </button>
          </div>
          <div className="g-fs-stage">
            <Art id={p.id} emoji={p.emoji} name={name} image={p.image} view={view} sizes="100vw" />
            <button type="button" className="g-fs-nav l" aria-label="Previous image" onClick={() => go(view - 1)}>
              <Icon name="chevronLeft" />
            </button>
            <button type="button" className="g-fs-nav r" aria-label="Next image" onClick={() => go(view + 1)}>
              <Icon name="chevronRight" />
            </button>
          </div>
          <div className="g-fs-thumbs" role="group" aria-label="Product views">
            {Array.from({ length: VIEWS }, (_, i) => (
              <button key={i} type="button" className={`thumb${view === i ? ' on' : ''}`} aria-label={`View ${i + 1}`} aria-pressed={view === i} onClick={() => onView(i)}>
                <Art id={p.id} emoji={p.emoji} name="" image={p.image} view={i} sizes="80px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function OptionPicker({ opts, value, onChange }: { opts: NonNullable<Product['opts']>; value: number; onChange: (i: number) => void }) {
  return (
    <div className="optrow" role="group" aria-label={opts.label}>
      <span className="optlabel">{opts.label}</span>
      <div className="chips">
        {opts.values.map((v, i) => (
          <button key={v} type="button" className={`chip${value === i ? ' on' : ''}`} aria-pressed={value === i} onClick={() => onChange(i)}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Six digits in, a delivery date or a fix-it message out. */
export function PincodeCheck() {
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const check = () => {
    if (!/^\d{6}$/.test(pin)) return setMsg({ ok: false, text: 'Enter a valid 6-digit pincode.' });
    setMsg({ ok: true, text: `Delivery available. Get it by ${fmtWeekday(Date.now() + 4 * 864e5)}.` });
  };
  return (
    <div>
      <div className="pin">
        <input
          value={pin}
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter pincode"
          aria-label="Delivery pincode"
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ''));
            setMsg(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
        />
        <button type="button" className="btn ghost" onClick={check}>
          Check
        </button>
      </div>
      {msg && (
        <p className={`pm ${msg.ok ? 'ok' : 'bad'}`} role="status">
          {msg.text}
        </p>
      )}
    </div>
  );
}

const NAMES = ['Anjali R', 'Karthik M', 'Divya S', 'Imran K', 'Meena P', 'Suresh V', 'Lakshmi N', 'Arjun T'];
const TITLES = ['Exactly as described', 'Better than expected', 'Quick delivery', 'A lovely gift', 'Good value', 'Happy with it'];
const TEXTS = [
  'Exactly as described and packed with care.',
  'Quality is better than I expected for the price.',
  'Delivery was quick and I will order again.',
  'Gifted this to family and they loved it.',
  'Good value for money.',
  'Using it for two weeks and very happy.',
];

export function ReviewList({ product: p }: { product: Product }) {
  const h = hash(p.id);
  // Spread of ratings that adds up to the product's average, so the bars and the headline agree.
  const dist = useMemo(() => {
    const hi = Math.max(0, Math.min(1, (p.rating - 3) / 2));
    const five = 40 + hi * 40;
    const four = 30 - hi * 12;
    const three = 15 - hi * 9;
    const two = 8 - hi * 6;
    const one = 100 - five - four - three - two;
    return [five, four, three, two, one].map((v) => Math.round(v));
  }, [p.rating]);
  return (
    <div className="rv-grid">
      <div className="rv-sum">
        <p className="rv-big">
          <b>{p.rating.toFixed(1)}</b>
          <span>out of 5</span>
        </p>
        <Stars rating={p.rating} />
        <p className="rv-n">
          Based on {p.rev.toLocaleString('en-IN')} review{p.rev === 1 ? '' : 's'}
        </p>
        <ul aria-label="Rating breakdown">
          {dist.map((v, i) => (
            <li key={i}>
              <span>{5 - i} star</span>
              <i aria-hidden="true">
                <u style={{ width: `${Math.max(0, v)}%` }} />
              </i>
              <span>{Math.max(0, v)}%</span>
            </li>
          ))}
        </ul>
      </div>
      <ul className="rv-list">
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <article className="rvi">
              <Stars rating={i === 2 ? 4 : 5} />
              <h3>{TITLES[(h + i * 2) % 6]}</h3>
              <p>{TEXTS[(h + i * 5) % 6]}</p>
              <footer>
                <b>{NAMES[(h + i * 3) % 8]}</b>
                <span className="rv-ver">
                  <Icon name="shield" size={14} /> Verified purchase
                </span>
              </footer>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

type TabKey = 'desc' | 'det' | 'rev';

export function Tabs({ product: p }: { product: Product }) {
  const [tab, setTab] = useState<TabKey>('desc');
  const desc = useText(productDescId(p.id), p.desc);
  const det = (p.d ?? '').split('|').filter(Boolean);
  const tabs: [TabKey, string][] = [
    ['desc', 'Description'],
    ['det', 'Details'],
    ['rev', 'Reviews'],
  ];
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Product information">
        {tabs.map(([k, label]) => (
          <button key={k} id={`tab-${k}`} type="button" role="tab" aria-selected={tab === k} aria-controls="tabpanel" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="tc" id="tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'desc' && <p>{desc}</p>}
        {tab === 'det' && (
          <ul>
            {(det.length ? det : ['Made in India', 'Ships within 24 hours']).map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
        {tab === 'rev' && (p.rev > 0 ? <ReviewList product={p} /> : <p>No reviews yet</p>)}
      </div>
    </>
  );
}
