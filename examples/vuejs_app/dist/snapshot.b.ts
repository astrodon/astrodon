import { decode } from "https://deno.land/std@0.92.0/encoding/ascii85.ts";
import { decompress } from "https://deno.land/x/brotli@v0.1.4/mod.ts";
import { parse } from "https://raw.githubusercontent.com/trgwii/bundler/master/parse.ts";
export default await parse(
  decompress(
    decode(
      "8%E.g-q:>DaUao9N)2Jw93qXLndJg?2$.hg[tfAPSOD1at9(TDi@BW@UMb[wVh.&1uU-Kg)+et$/08kcKzdzw7%NgusA7IlbECdbN0i/ANaSCzB.Q-.s/U)CS(UpM.W@A%e(SvMqF@(gtKWwJUTRCwQa/<TGW2AI35Gkdr%z$p+QG28]J@xCw4ylKp}EN5BE-G)GX2%VdIVi(jki]8/SoSM6<=(jN3m:0G)U0q)y(Gv<o>ICmYCwBM8W#/yd?AjP}bWKqJvV.]@/0)YM5@Z<3t<Us5Uay60a8c8O4MKkJWg6G06X9YRC@8F?vi[qZxi]b1j60L[ZI6tbw<3v.ZgpF]#(/Mmn)SI/6m!ySC/>N85Vkn2t))iM]<OubFQCnOuVp37.w{WB2ZH.8/8FU]3$K6-Xm)l:YPvUrFd6+FAKd=IyTnjD(^g-u^I>SM9DJ:cpfs>VTmA2}AywIXK4)mq]8l^J*}EsY?FO^nEkILL.(b<R=4d>B$Z/WO{t@*6*??Jt+Ph)^k<)XSwIy2<WOL=:[qt9KsDO^)w[wy1q@N}]gtinJAd:0Y&NIJ3R^{pW?CzoRq^:2B}GxR$5bInu:Gd0}uMP9so!1h53rLGZ)Yy20um7GiTmN1H:I2^2?P]-Gc)W)n08qs(Yr2[3GH<Q/w4w({>j>FKV70ScraNVR&%*/r)PGnfTb{>-Mds8.IfwHsa{#x?^>q4b!P>Y:xU6T:^MT19VKGeeK4jrv6A.wqKO^15(#HFA5:Zo^3aP[[L&yi<hGkhImAt&EMZ!DLr<@MhGFh-R1xFenA+o.Y/GFMCqd$zLTLSszF9.gOWnX(qx=@j7sz)a@fmF@3-rIpek)E<GAarnrNVsKc#KIB24vh!y6xuAVAEhtwNH>8meAALn6a?SMzHrz78)VLkV.hw}zApG&6VUZ(DF&nkRUH=u=-3x:+3&?b2@LuQD6OX9sE90wv?CJd!A.+xi]jWjX.VR-mpBA!WY#K0ufw4NM!ANc}bGf{r2XtM4wqt8+KV24uL6]rw7yWVZ&VVdViU=vd]E=fND<5oZgQ!{/0+XT@wpo(7K$RVkpqczzDKjLjwoyhJ({4K<^dFK[JgoH1f$[]gVF+fTol^SW!P6X.=]SwJJxIuLnZ}g+lR?(fXe{F}a<^?zrK3qUvkGxlpRk/n+k5>d*-sS:2miBe*yfo3D?4+6T8F!3!51(A4ce%Trm55]Bk(xbTe}zdUn+]exxxa>V:}GUV}p>(bv}NC0e2:O%2u<Dlhy!ar)RXBq]P+KEq.f63fJ}sFWU]p{LqC^=5anR8mFZ-7xQfjI%",
      { standard: "Z85" },
    ),
  ),
) as { "App.js": Uint8Array, components: { "Button.js": Uint8Array, "Header.js": Uint8Array }, "index.html": Uint8Array, "main.css": Uint8Array, "main.js": Uint8Array, "router.js": Uint8Array, views: { "About.js": Uint8Array, "Home.js": Uint8Array } };
