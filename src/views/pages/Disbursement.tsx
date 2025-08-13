import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, CheckCircle2, Send, ReceiptText, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { DisbursementItem, DisbursementPlan, DisbursementRequest, PlanItem } from "@/types/disbursement";

// MOCKS dataa
const PROJECTS = [
  { id: "p1", name: "Dự Án Xây Dựng Tiêu Chuẩn" },
  { id: "p2", name: "Cầu Vượt Khu Công Nghiệp" },
];

const CONTRACTS = [
  { id: "c1", projectId: "p1", name: "Gói Thầu Thi Công A", retentionRate: 5 },
  { id: "c2", projectId: "p1", name: "Gói Thầu Cung Ứng B", retentionRate: 10 },
  { id: "c3", projectId: "p2", name: "Gói Thầu Móng Cọc", retentionRate: 7.5 },
];

// Demo một kế hoạch mặc định theo tháng
function defaultPlan(projectId: string, contractId: string): DisbursementPlan {
  const ym = (offset:number)=>{
    const d = new Date(); d.setMonth(d.getMonth()+offset); return format(d, "yyyy-MM");
  };
  return {
    id: Math.random().toString(36).slice(2),
    projectId, contractId,
    items: [
      { id: "pl1", period: ym(0), plannedAmount: 300_000_000 },
      { id: "pl2", period: ym(1), plannedAmount: 400_000_000 },
      { id: "pl3", period: ym(2), plannedAmount: 300_000_000 },
    ],
  };
}

// HELPERS
function calcDisbursement(
  items: DisbursementItem[],
  retentionRate: number,
  advanceDeduction: number
) {
  const requested = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const tax = items.reduce((s, i) => s + (Number(i.amount) || 0) * (Number(i.taxRate) || 0) / 100, 0);
  const retention = requested * (Number(retentionRate) || 0) / 100;
  const payable = requested + tax - retention - (Number(advanceDeduction) || 0);
  return { requested, tax, retention, payable };
}

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n || 0);
}

function newItem(): DisbursementItem {
  return { id: Math.random().toString(36).slice(2), description: "", amount: 0, taxRate: 8 };
}

export default function DisbursementDemo() {
  const [requests, setRequests] = useState<DisbursementRequest[]>([]);
  // Giả lập một kế hoạch gắn với p1/c1. Thực tế bạn sẽ fetch từ API riêng.
  const [plan, setPlan] = useState<DisbursementPlan>(defaultPlan("p1", "c1"));

  const actualByPeriod = useMemo(() => {
    const map: Record<string, number> = {};
    requests.filter(r=> r.status !== "REJECTED").forEach(r=>{
      const totals = calcDisbursement(r.items, r.retentionRate, r.advanceDeduction);
      map[r.period] = (map[r.period]||0) + totals.payable * (r.completionPct/100);
    });
    return map; // số đã thực hiện quy đổi theo % hoàn thành
  }, [requests]);

  return (
    <div className="p-6 grid gap-6">
      <HeaderBar onNew={(r) => setRequests((d) => [r, ...d])} />

      <Tabs defaultValue="actual" className="grid gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="plan">Kế hoạch</TabsTrigger>
          <TabsTrigger value="actual">Giải ngân thực tế</TabsTrigger>
        </TabsList>

        <TabsContent value="plan">
          <PlanCard plan={plan} actualByPeriod={actualByPeriod} onUpdatePlan={setPlan} />
        </TabsContent>

        <TabsContent value="actual">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Đề Nghị Giải Ngân (Thực tế)</CardTitle>
            </CardHeader>
            <CardContent>
              <ListTable rows={requests} onUpdate={(r)=>setRequests(arr=>arr.map(x=>x.id===r.id?r:x))} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// HEADER + NEW DIALOG
function HeaderBar({ onNew }: { onNew: (r: DisbursementRequest) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Tài Chính · Kế hoạch & Giải Ngân</h1>
        <p className="text-sm text-muted-foreground">Lập kế hoạch theo tháng, sau đó nhập giải ngân thực tế và đánh dấu % hoàn thành.</p>
      </div>
      <NewDisbursementDialog onCreated={onNew} />
    </div>
  );
}

// PLAN VIEW
function PlanCard({ plan, actualByPeriod, onUpdatePlan }:{ plan:DisbursementPlan; actualByPeriod:Record<string,number>; onUpdatePlan:(p:DisbursementPlan)=>void }){
  const totalPlan = plan.items.reduce((s,i)=>s+i.plannedAmount,0);
  const totalActual = plan.items.reduce((s,i)=> s + (actualByPeriod[i.period]||0), 0);
  const pctTotal = totalPlan ? Math.round((totalActual/totalPlan)*100) : 0;

  function addRow(){
    onUpdatePlan({ ...plan, items:[...plan.items, { id: Math.random().toString(36).slice(2), period: format(new Date(), "yyyy-MM"), plannedAmount: 0 }]});
  }
  function update(idx:number, patch:Partial<PlanItem>){
    const items = [...plan.items]; items[idx] = { ...items[idx], ...patch } as PlanItem; onUpdatePlan({ ...plan, items });
  }
  function remove(idx:number){ onUpdatePlan({ ...plan, items: plan.items.filter((_,i)=>i!==idx) }); }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Kế hoạch giải ngân theo tháng</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between">
          <Button size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-1"/>Thêm dòng</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tháng</TableHead>
              <TableHead className="text-right">Kế hoạch</TableHead>
              <TableHead className="text-right">Thực hiện (VNĐ)</TableHead>
              <TableHead className="text-right">(%) Hoàn thiện so kế hoạch</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plan.items.map((it, idx)=>{
              const act = actualByPeriod[it.period] || 0;
              const pct = it.plannedAmount ? Math.min(100, Math.round(act/it.plannedAmount*100)) : 0;
              return (
                <TableRow key={it.id}>
                  <TableCell className="flex items-center gap-2"><Calendar className="w-4 h-4"/>{it.period}
                    <Input className="ml-3 w-36" value={it.period} onChange={e=>update(idx,{period:e.target.value})}/>
                  </TableCell>
                  <TableCell className="text-right"><Input className="w-44 ml-auto text-right" type="number" value={it.plannedAmount} onChange={e=>update(idx,{plannedAmount:Number(e.target.value)||0})}/></TableCell>
                  <TableCell className="text-right">{fmt(act)}</TableCell>
                  <TableCell className="text-right w-56">
                    <div className="flex flex-col gap-1">
                      <Progress value={pct}/>
                      <div className="text-xs text-muted-foreground text-right">{pct}%</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={()=>remove(idx)}><Trash2 className="w-4 h-4"/></Button></TableCell>
                </TableRow>
              );
            })}
            {plan.items.length===0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Chưa có dòng kế hoạch.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Tổng kế hoạch" value={`${fmt(totalPlan)} đ`} />
          <Stat label="Tổng thực hiện (quy đổi)" value={`${fmt(totalActual)} đ`} />
          <Stat label="Tỷ lệ hoàn thành KH" value={`${pctTotal}%`} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({label, value}:{label:string; value:string}){
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="text-muted-foreground text-sm">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

// LIST (ACTUAL)
function StatusBadge({ s }: { s: DisbursementRequest["status"] }) {
  return <Badge variant={s === "APPROVED" ? "outline" : s === "PAID" ? "destructive" : "secondary"}>{s}</Badge>;
}

function ListTable({ rows, onUpdate }: { rows: DisbursementRequest[]; onUpdate: (r:DisbursementRequest)=>void }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã</TableHead>
          <TableHead>Tháng</TableHead>
          <TableHead>Dự án</TableHead>
          <TableHead>Hợp đồng</TableHead>
          <TableHead className="text-right">Đề nghị</TableHead>
          <TableHead className="text-right">Phải trả</TableHead>
          <TableHead className="text-right">% hoàn thành</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground">Chưa có đề nghị.</TableCell>
          </TableRow>
        )}
        {rows.map((r) => {
          const totals = calcDisbursement(r.items, r.retentionRate, r.advanceDeduction);
          return (
            <TableRow key={r.id}>
              <TableCell>{r.code}</TableCell>
              <TableCell>{r.period}</TableCell>
              <TableCell>{PROJECTS.find(p=>p.id===r.projectId)?.name}</TableCell>
              <TableCell>{CONTRACTS.find(c=>c.id===r.contractId)?.name}</TableCell>
              <TableCell className="text-right">{fmt(totals.requested)}</TableCell>
              <TableCell className="text-right font-medium">{fmt(totals.payable)}</TableCell>
              <TableCell className="text-right">
                <div className="min-w-40">
                  <Progress value={r.completionPct} />
                  <div className="text-xs text-muted-foreground text-right">{r.completionPct}%</div>
                </div>
              </TableCell>
              <TableCell><StatusBadge s={r.status} /></TableCell>
              <TableCell className="space-x-2">
                {r.status === "DRAFT" && <Button size="sm" onClick={()=>onUpdate({...r, status:"SUBMITTED", submittedAt: new Date().toISOString()})}><Send className="w-4 h-4 mr-1"/>Gửi duyệt</Button>}
                {r.status === "APPROVED" && <Button size="sm"><ReceiptText className="w-4 h-4 mr-1"/>Tạo lệnh chi</Button>}
                {r.status === "PAYMENT_ORDERED" && <Button size="sm"><DollarSign className="w-4 h-4 mr-1"/>Đánh dấu đã chi</Button>}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// NEW WIZARD (ACTUAL)
function NewDisbursementDialog({ onCreated }: { onCreated: (r: DisbursementRequest) => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [projectId, setProjectId] = useState(PROJECTS[0]?.id ?? "");
  const [contractId, setContractId] = useState<string>("");
  const [period, setPeriod] = useState<string>(format(new Date(), "yyyy-MM"));
  const [items, setItems] = useState<DisbursementItem[]>([newItem()]);
  const [note, setNote] = useState("");
  const [advance, setAdvance] = useState(0);
  const [completionPct, setCompletionPct] = useState<number>(80);

  const retentionRate = useMemo(() => CONTRACTS.find(c => c.id === contractId)?.retentionRate ?? 0, [contractId]);
const totals = useMemo(() => {
  const base = calcDisbursement(items, retentionRate, advance);
  // Áp dụng % hoàn thành vào tất cả các giá trị liên quan
  const factor = completionPct / 100;
  return {
    requested: base.requested * factor,
    tax: base.tax * factor,
    retention: base.retention * factor,
    payable: base.payable * factor,
  };
}, [items, retentionRate, advance, completionPct]);

  const projectContracts = useMemo(() => CONTRACTS.filter(c => c.projectId === projectId), [projectId]);

  function reset() {
    setStep(1);
    setProjectId(PROJECTS[0]?.id ?? "");
    setContractId("");
    setPeriod(format(new Date(), "yyyy-MM"));
    setItems([newItem()]);
    setNote("");
    setAdvance(0);
    setCompletionPct(80);
  }

  function create() {
    const code = `DN-${format(new Date(), "yyMMdd-HHmm")}`;
    const r: DisbursementRequest = {
      id: Math.random().toString(36).slice(2),
      code,
      projectId,
      contractId: contractId || projectContracts[0]?.id || "",
      period,
      items,
      note,
      advanceDeduction: advance,
      retentionRate,
      completionPct,
      status: "DRAFT",
    };
    onCreated(r);
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={(o)=>{setOpen(o); if(!o) reset();}}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl"><Plus className="w-4 h-4 mr-1"/>Đề nghị giải ngân</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tạo Đề Nghị Giải Ngân</DialogTitle>
        </DialogHeader>
        <div className="mt-2 grid gap-6">
          <Stepper step={step} setStep={setStep} />
          {step === 1 && (
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Dự án</Label>
                  <Select value={projectId} onValueChange={(v)=>{setProjectId(v); setContractId("");}}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn dự án"/></SelectTrigger>
                    <SelectContent>
                      {PROJECTS.map(p=> <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hợp đồng</Label>
                  <Select value={contractId} onValueChange={setContractId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn hợp đồng"/></SelectTrigger>
                    <SelectContent>
                      {projectContracts.map(c=> <SelectItem key={c.id} value={c.id}>{c.name} · Retention {c.retentionRate}%</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tháng (gắn KH)</Label>
                  <Input className="mt-1" value={period} onChange={(e)=>setPeriod(e.target.value)} placeholder="YYYY-MM" />
                </div>
              </div>
              <div>
                <Label>Ghi chú</Label>
                <Input className="mt-1" value={note} onChange={e=>setNote(e.target.value)} placeholder="Ví dụ: Nghiệm thu đợt 1"/>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4">
              <ItemsEditor items={items} setItems={setItems} />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Khấu trừ tạm ứng</Label>
                  <Input type="number" className="mt-1" value={advance} onChange={e=>setAdvance(Number(e.target.value)||0)} />
                </div>
                <div>
                  <Label>Tỷ lệ giữ lại</Label>
                  <Input disabled className="mt-1" value={`${retentionRate}%`} />
                </div>
                <div>
                  <Label>% Hoàn thành cho kỳ này</Label>
                  <div className="mt-3">
                    <Slider defaultValue={[completionPct]} value={[completionPct]} onValueChange={(v)=>setCompletionPct(v[0])} max={100} step={5}/>
                    <div className="text-xs text-muted-foreground text-right mt-1">{completionPct}%</div>
                  </div>
                </div>
              </div>
              <TotalsCard totals={totals} />
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-3">
              <div className="border-dashed border rounded-xl p-6 text-center">Khu vực upload chứng từ</div>
              <TotalsCard totals={totals} compact />
            </div>
          )}
        </div>
        <DialogFooter className="justify-between">
          <div className="text-sm text-muted-foreground">Bước {step}/3</div>
          <div className="space-x-2">
            {step > 1 && <Button variant="outline" onClick={()=>setStep((s)=> (s-1) as any)}>Quay lại</Button>}
            {step < 3 && <Button onClick={()=>setStep((s)=> (s+1) as any)}>Tiếp tục</Button>}
            {step === 3 && <Button onClick={create}><CheckCircle2 className="w-4 h-4 mr-1"/>Tạo bản nháp</Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ step, setStep }:{ step:1|2|3; setStep:(s:1|2|3)=>void }){
  return (
    <Tabs value={String(step)} onValueChange={(v)=>setStep(Number(v) as 1|2|3)}>
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="1">1. Thông tin</TabsTrigger>
        <TabsTrigger value="2">2. Chi tiết</TabsTrigger>
        <TabsTrigger value="3">3. Chứng từ</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function ItemsEditor({ items, setItems }:{ items:DisbursementItem[]; setItems:(i:DisbursementItem[])=>void }){
  function update(idx:number, patch:Partial<DisbursementItem>){
    const clone = [...items];
    clone[idx] = { ...clone[idx], ...patch } as DisbursementItem;
    setItems(clone);
  }
  function add(){ setItems([...items, newItem()]); }
  function remove(idx:number){ setItems(items.filter((_,i)=>i!==idx)); }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>Chi tiết hạng mục</Label>
        <Button size="sm" onClick={add}><Plus className="w-4 h-4 mr-1"/>Thêm dòng</Button>
      </div>
      <div className="grid gap-2">
        {items.map((it, idx)=> (
          <div key={it.id} className="grid grid-cols-12 gap-2 items-center border rounded-xl p-3">
            <Input className="col-span-5" placeholder="Mô tả" value={it.description} onChange={e=>update(idx,{description:e.target.value})} />
            <Input className="col-span-3" type="number" placeholder="Giá trị (trước thuế)" value={it.amount} onChange={e=>update(idx,{amount:Number(e.target.value)||0})} />
            <div className="col-span-3 flex items-center gap-2">
              <Input type="number" placeholder="Thuế %" value={it.taxRate} onChange={e=>update(idx,{taxRate:Number(e.target.value)||0})} />
              <span className="text-sm text-muted-foreground">VAT %</span>
            </div>
            <Button variant="ghost" size="icon" className="col-span-1" onClick={()=>remove(idx)}>
              <Trash2 className="w-4 h-4"/>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TotalsCard({ totals, compact }:{ totals:{requested:number; tax:number; retention:number; payable:number}; compact?:boolean }){
  const pct = totals.requested ? Math.max(0, Math.min(100, Math.round( (totals.payable / totals.requested) * 100 ))) : 0;
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className={`grid ${compact? 'grid-cols-2' : 'grid-cols-4'} gap-4 text-sm`}>
          <div><div className="text-muted-foreground">Giá trị đề nghị</div><div className="text-lg font-semibold">{fmt(totals.requested)} đ</div></div>
          <div><div className="text-muted-foreground">Thuế VAT</div><div className="text-lg font-semibold">{fmt(totals.tax)} đ</div></div>
          {!compact && <div><div className="text-muted-foreground">Retention</div><div className="text-lg font-semibold">{fmt(totals.retention)} đ</div></div>}
          <div><div className="text-muted-foreground">Phải trả</div><div className="text-lg font-semibold">{fmt(totals.payable)} đ</div></div>
        </div>
        {!compact && (
          <div className="mt-3">
            <Progress value={pct} />
            <div className="mt-1 text-xs text-muted-foreground">Phải trả / Đã yêu cầu: {pct}%</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
