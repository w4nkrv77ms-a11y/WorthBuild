export default async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  const secret=process.env.ADMIN_PASSWORD;
  const cookie=(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("iw_admin="));
  if(!secret||!cookie) return res.status(401).json({error:"Unauthorized"});
  const token=cookie.slice("iw_admin=".length);
  const crypto=await import("node:crypto");
  const expected=crypto.createHmac("sha256",secret).update("admin-session").digest("hex");
  if(token!==expected) return res.status(401).json({error:"Unauthorized"});
  const key=process.env.PADDLE_API_KEY;
  if(!key) return res.status(503).json({error:"Paddle API is not configured"});
  try{
    const r=await fetch("https://api.paddle.com/transactions?per_page=100",{headers:{Authorization:"Bearer "+key,Accept:"application/json"}});
    const body=await r.json();
    if(!r.ok) return res.status(r.status).json({error:"Paddle API error"});
    const items=Array.isArray(body.data)?body.data:[];
    const paid=items.filter(t=>t.status==="completed"||t.status==="paid");
    const revenue=paid.reduce((sum,t)=>{const v=t?.details?.totals?.grand_total; const n=Number(v); return sum+(Number.isFinite(n)?n/100:0)},0);
    const recent=paid.slice(0,10).map(t=>({id:t.id,status:t.status,created_at:t.created_at,amount:Number(t?.details?.totals?.grand_total||0)/100,currency:t?.currency_code||t?.details?.totals?.currency_code||"USD",customer:t?.customer_id||null}));
    return res.status(200).json({transactions:paid.length,revenue_usd:revenue,recent});
  }catch(e){return res.status(500).json({error:"Unable to load Paddle data"});}
}