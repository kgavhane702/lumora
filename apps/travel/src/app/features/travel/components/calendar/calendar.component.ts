import { Component, ElementRef, HostListener, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

type Day = { key: string; label: string; date: string; place: string };
type AllDayItem = { title: string; danger?: boolean };
type EventItem = { id: string; title: string; start: string; end: string; danger?: boolean };
type LaidOutEvent = EventItem & { startIdx: number; endIdx: number };
type MoveOrResize = 'move' | 'resize';
type ResizeEdge = 'top' | 'bottom';

interface DragState {
  mode: MoveOrResize;
  eventId: string;
  fromDay: string;
  durationSlots?: number;
  // move
  offsetX?: number;
  offsetY?: number;
  ghost?: { w: number; h: number; left: number; top: number };
  // resize
  baseStartIdx?: number;
  baseEndIdx?: number;
  resizeMode?: ResizeEdge;
}

interface PreviewState {
  type: MoveOrResize;
  dayKey: string;
  startIdx: number;
  endIdx: number;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CalendarComponent implements OnInit {
  // ---- Config ----
  slotsPerHour = 4;                // 15-min slots
  slotMinutes  = 60 / this.slotsPerHour;
  slotCount    = 24 * this.slotsPerHour;
  slotHeight   = 22;               // keep in sync with CSS --slot-h

  // Sample data (replace via @Input later)
  days: Day[] = [
    { key: '2025-12-15', label: 'Day 1', date: 'Dec 15', place: 'Candolim, North Goa' },
    { key: '2025-12-16', label: 'Day 2', date: 'Dec 16', place: 'Candolim & Fort Aguada' },
    { key: '2025-12-17', label: 'Day 3', date: 'Dec 17', place: 'Anjuna, North Goa' },
    { key: '2025-12-18', label: 'Day 4', date: 'Dec 18', place: 'Baga, North Goa' },
    { key: '2025-12-19', label: 'Day 5', date: 'Dec 19', place: 'Old Goa & Panjim' },
    { key: '2025-12-20', label: 'Day 6', date: 'Dec 20', place: 'Candolim, North Goa' },
  ];

  allDay: Record<string, AllDayItem[]> = {
    '2025-12-15': [{ title: 'Candolim Beach Resort' }],
    '2025-12-18': [{ title: 'Beach Relaxation', danger: true }],
    '2025-12-20': [{ title: 'Candolim Beach Resort' }],
  };

  events: Record<string, EventItem[]> = {
    '2025-12-15': [
      { id: 'e1', title: 'Welcome Walk',  start: '09:30', end: '10:30' }, // try 09:30 to verify alignment
      { id: 'e2', title: 'Cafe Brunch',   start: '11:00', end: '12:00' },
      { id: 'e3', title: 'Sunset Cruise', start: '18:00', end: '20:00', danger: true },
    ],
    '2025-12-18': [
      { id: 'e4', title: 'Beach Time',    start: '15:00', end: '17:00', danger: true },
    ],
    '2025-12-19': [
      { id: 'e5', title: 'Old Goa Tour',  start: '10:00', end: '13:00' },
      { id: 'e6', title: 'Panjim Lunch',  start: '13:00', end: '14:00' },
    ]
  };

  // Runtime
  drag: DragState | null = null;
  preview: PreviewState | null = null;

  @ViewChild('calendarBody', { static: true }) calendarBody!: ElementRef<HTMLElement>;
  @ViewChild('calHeader', { static: true }) calHeader!: ElementRef<HTMLElement>;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const headerH = this.calHeader.nativeElement.offsetHeight;
    this.calendarBody.nativeElement.style.setProperty('--grid-offset', headerH + 'px');
  }

  // ---------- Layout helpers ----------
  toMinutesSinceMidnight(hhmm: string){ const [h,m] = hhmm.split(':').map(Number); return h*60 + m; }
  toSlotIndex(minutes: number, round: 'floor' | 'ceil' = 'floor'){
    const idx = minutes / this.slotMinutes;
    return round === 'ceil' ? Math.ceil(idx) : Math.floor(idx);
  }
  slotIndexToMinutes(idx: number){ return idx * this.slotMinutes; }
  clamp(n: number, min: number, max: number){ return Math.max(min, Math.min(max, n)); }
  toHHMM(min: number){
    const h = Math.floor(min/60); const m = Math.round(min%60);
    return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
  }

  layoutDay(dayEvents: EventItem[]): LaidOutEvent[] {
    return (dayEvents || []).map(e => {
      const startIdx = this.toSlotIndex(this.toMinutesSinceMidnight(e.start), 'floor');
      const endIdx   = Math.max(startIdx + 1, this.toSlotIndex(this.toMinutesSinceMidnight(e.end), 'ceil'));
      return { ...e, startIdx, endIdx };
    }).sort((a,b) => a.startIdx - b.startIdx || a.endIdx - b.endIdx);
  }

  intersects(aStart: number, aEnd: number, bStart: number, bEnd: number){ return aStart < bEnd && bStart < aEnd; }

  // v3: slide to next free slot if overlapped (no push)
  placeWithoutOverlap(dayKey: string, excludeId: string, startIdx: number, durationSlots: number){
    const day = this.layoutDay((this.events[dayKey] || []).filter(ev => ev.id !== excludeId));
    let s = this.clamp(startIdx, 0, this.slotCount - 1);
    let e = this.clamp(s + durationSlots, 1, this.slotCount);
    while(true){
      let overlapped = false;
      for(const ev of day){
        if(this.intersects(s, e, ev.startIdx, ev.endIdx)){
          s = ev.endIdx;
          e = s + durationSlots;
          if(e > this.slotCount){ e = this.slotCount; s = e - durationSlots; }
          overlapped = true;
        }
      }
      if(!overlapped) break;
    }
    return { startIdx: s, endIdx: e };
  }

  laidFor(dayKey: string){ return this.layoutDay(this.events[dayKey] || []); }

  // ---------- Preview helpers ----------
  clearPreview(){ this.preview = null; }
  clearPreviewOfType(type: MoveOrResize){ if(this.preview && this.preview.type === type) this.preview = null; }
  ensurePreview(type: MoveOrResize, dayKey: string, s: number, e: number){ this.preview = { type, dayKey, startIdx: s, endIdx: e }; }

  // ---------- Drag (move) ----------
  onChipPointerDownMove(event: PointerEvent, dayKey: string, evItem: LaidOutEvent, chipEl: HTMLDivElement){
    if ((event.target as HTMLElement).classList.contains('handle')) return; // ignore resize handles
    event.preventDefault();

    const rect = chipEl.getBoundingClientRect();
    this.drag = {
      mode: 'move',
      eventId: evItem.id,
      fromDay: dayKey,
      durationSlots: evItem.endIdx - evItem.startIdx,
      offsetX: event.clientX - (rect.left + rect.width/2),
      offsetY: event.clientY - (rect.top  + rect.height/2),
      ghost: { w: rect.width, h: rect.height, left: event.clientX, top: event.clientY }
    };
  }

  updateGhost(clientX: number, clientY: number){
    if(!this.drag?.ghost) return;
    this.drag.ghost.left = clientX - (this.drag.offsetX ?? 0);
    this.drag.ghost.top  = clientY - (this.drag.offsetY ?? 0);
  }

  findDayColAt(x: number, y: number): { el: HTMLElement; dayKey: string } | null {
    const cols = Array.from(this.calendarBody.nativeElement.querySelectorAll<HTMLElement>('.day-col'));
    for(const col of cols){
      const r = col.getBoundingClientRect();
      if(x >= r.left && x <= r.right && y >= r.top && y <= r.bottom){
        return { el: col, dayKey: col.dataset['dayKey']! };
      }
    }
    return null;
  }
  findDayColByX(x: number): { el: HTMLElement; dayKey: string } | null {
    const cols = Array.from(this.calendarBody.nativeElement.querySelectorAll<HTMLElement>('.day-col'));
    for(const col of cols){
      const r = col.getBoundingClientRect();
      if(x >= r.left && x <= r.right){ return { el: col, dayKey: col.dataset['dayKey']! }; }
    }
    return null;
  }

  updateMovePreview(target: { el: HTMLElement; dayKey: string } | null, clientY: number){
    if(!target){ this.clearPreviewOfType('move'); return; }
    const colRect = target.el.getBoundingClientRect();
    const slotIdx = this.clamp(Math.floor((clientY - colRect.top) / this.slotHeight), 0, this.slotCount-1);
    const placed = this.placeWithoutOverlap(target.dayKey, this.drag!.eventId, slotIdx, this.drag!.durationSlots!);
    this.ensurePreview('move', target.dayKey, placed.startIdx, placed.endIdx);
  }

  // ---------- Resize ----------
  onHandlePointerDown(event: PointerEvent, dayKey: string, evItem: LaidOutEvent, edge: ResizeEdge){
    event.preventDefault();
    this.drag = {
      mode: 'resize',
      eventId: evItem.id,
      fromDay: dayKey,
      baseStartIdx: evItem.startIdx,
      baseEndIdx: evItem.endIdx,
      resizeMode: edge
    };
  }

  resizeClamped(dayKey: string, excludeId: string, mode: ResizeEdge, baseStartIdx: number, baseEndIdx: number, desiredIdx: number){
    const day = this.layoutDay((this.events[dayKey] || []).filter(ev => ev.id !== excludeId));
    let prevEnd = 0;
    let nextStart = this.slotCount;
    for(const ev of day){
      if(ev.endIdx <= baseStartIdx){ prevEnd = Math.max(prevEnd, ev.endIdx); }
      if(ev.startIdx >= baseEndIdx){ nextStart = Math.min(nextStart, ev.startIdx); break; }
    }
    if(mode === 'top'){
      const s = this.clamp(desiredIdx, prevEnd, baseEndIdx - 1);
      return { startIdx: s, endIdx: baseEndIdx };
    }else{
      const e = this.clamp(desiredIdx, baseStartIdx + 1, nextStart);
      return { startIdx: baseStartIdx, endIdx: e };
    }
  }

  updateResizePreview(dayKey: string, clientY: number){
    // stay in same day
    const colEl = this.calendarBody.nativeElement.querySelector<HTMLElement>(`.day-col[data-day-key="${dayKey}"]`);
    if(!colEl){ this.clearPreviewOfType('resize'); return; }
    const colRect = colEl.getBoundingClientRect();
    const rawIdx = this.clamp(Math.floor((clientY - colRect.top) / this.slotHeight), 0, this.slotCount-1);
    const { startIdx, endIdx } = this.resizeClamped(
      dayKey,
      this.drag!.eventId,
      this.drag!.resizeMode!,
      this.drag!.baseStartIdx!,
      this.drag!.baseEndIdx!,
      rawIdx
    );
    this.ensurePreview('resize', dayKey, startIdx, endIdx);
  }

  // ---------- Window pointer handlers ----------
  @HostListener('window:pointermove', ['$event'])
  onWindowPointerMove(ev: PointerEvent){
    if(!this.drag) return;
    if(this.drag.mode === 'move'){
      this.updateGhost(ev.clientX, ev.clientY);
      const target = this.findDayColAt(ev.clientX, ev.clientY) || this.findDayColByX(ev.clientX);
      this.updateMovePreview(target, ev.clientY);
    } else if(this.drag.mode === 'resize'){
      this.updateResizePreview(this.drag.fromDay, ev.clientY);
    }
  }

  @HostListener('window:pointerup', ['$event'])
  onWindowPointerUp(_: PointerEvent){
    if(!this.drag) return;

    if(this.drag.mode === 'move'){
      if(this.preview && this.preview.type === 'move'){
        const { dayKey, startIdx, endIdx } = this.preview;
        const evObj = this.findEvent(this.drag.fromDay, this.drag.eventId);
        if(evObj){
          evObj.start = this.toHHMM(this.slotIndexToMinutes(startIdx));
          evObj.end   = this.toHHMM(this.slotIndexToMinutes(endIdx));
          if(dayKey !== this.drag.fromDay){
            // move between days
            this.events[this.drag.fromDay] = (this.events[this.drag.fromDay] || []).filter(e => e.id !== this.drag!.eventId);
            this.events[dayKey] = [...(this.events[dayKey] || []), evObj];
            // ensure unique by id across all days
            Object.keys(this.events).forEach(k => { if(k !== dayKey) this.events[k] = (this.events[k]||[]).filter(e => e.id !== evObj.id); });
          }
        }
      }
      this.clearPreview();
      this.drag = null;
    } else if(this.drag.mode === 'resize'){
      if(this.preview && this.preview.type === 'resize'){
        const dayKey = this.drag.fromDay;
        const evObj = this.findEvent(dayKey, this.drag.eventId);
        if(evObj){
          evObj.start = this.toHHMM(this.slotIndexToMinutes(this.preview.startIdx));
          evObj.end   = this.toHHMM(this.slotIndexToMinutes(this.preview.endIdx));
        }
      }
      this.clearPreview();
      this.drag = null;
    }
  }

  getEventDurationSlots(dayKey: string, id: string){
    const ev = (this.events[dayKey] || []).find(e => e.id === id);
    if(!ev) return 4;
    const s = this.toSlotIndex(this.toMinutesSinceMidnight(ev.start), 'floor');
    const e = this.toSlotIndex(this.toMinutesSinceMidnight(ev.end), 'ceil');
    return Math.max(1, e - s);
  }
  findEvent(dayKey: string, id: string){
    return (this.events[dayKey] || []).find(e => e.id === id);
  }

  // ---------- Times (12-hour labels) ----------
  times(): string[] {
    const arr: string[] = [];
    for (let h = 0; h < 24; h++) {
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      arr.push(`${hour12} ${ampm}`);
    }
    return arr;
  }

  // ---------- Template helpers ----------
  dayHasPreview(dayKey: string, type: MoveOrResize){
    return this.preview && this.preview.type === type && this.preview.dayKey === dayKey;
  }
}
