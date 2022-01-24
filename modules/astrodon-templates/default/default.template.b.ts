import { decode } from "https://deno.land/std@0.92.0/encoding/ascii85.ts";
import { decompress } from "https://deno.land/x/brotli@v0.1.4/mod.ts";
import { parse } from "https://raw.githubusercontent.com/trgwii/bundler/master/parse.ts";
export default await parse(
  decompress(
    decode(
      "8VZfz-q!5HtGlon3yl>w/aH7EFub/<S?U9uFZv}PXC74e/QsZ&rFw]x:Rt6}!bu+Sp8lyMROY.yA*7lUC4$iQ<:g1GDz0PySq1/}WrhAwDHXtbV/D@WRtf3j!^!&*!^H}kll?H.lHDoAa]w}I5qq1wBmlCJMZ-sj4W@[gq4Ixcn^9H]6&VPu2fLLF4n#+dSTh)1w<4UOS?a7O&tcpKH2S6//JLrch%aImqE)?m&vCTzo:*=-7p1-Y8K>xC4CEP#iDk=FdI3V^2slRlhFB(j=dS:d7^nrbs1hTuv}oH)TfAe.Zzq9M^BB:?p&*ihQ!MpQN-1)Td[/LjC</kXCU4s}}sKZ8Pl>GbJs4E.}i[}Jcwo^{vkZ:->^-S:TBD1B2G:UtlTWz$oa+Kok7%&h&]APZxQI7/XFt%H7f0@QfC-Vns$4mOWncgcR5dj?1[DMF&G9-4{!5>]<cp?C^rn0!pmP1z@F7Zuit+:sl(TZtH$U@m:@k7ML?zz=<!Fat4Z6]EGn:u2uc$%T^4ranfb45exB%*[v[nJfmHwJ(cLH]OIL8sH(7U2-+uwdQYwayXIicGaSwD>TV={xo6{XKmgO%]T{HJ%{7qy%T)nSdS+p!sU*d73=aaV>:(vzZLm063<+^:]^9zBxCnv(jB6Ns??}Y2@]Q.&gPYybPL{[:>79o2q5jLSTqLX@Lm)u0A!p=V>Kd:fMdrCwgwqNav7W}eYGYzJT89Hp7}jlN&u<uM-$p{to5V2OcYaj6=8Bl$-u@BhoBG?nf{2AcsJ@Qn/g!]3PsWRT2FD)S3eD*>gY[[Zx9Ft4KAM67n=Gj6y^Xvf6Mv}PWE8V3LmuS!q!1S{]mHGF6+l{snbku}pDn2:dDWN?BBVec@b>PG4$.<C0<EUHq-[xt0#IGdY)TpyU>up+.?&FqPZ^X<YqYn7J)w/U&xYlcbSSZteKk8Syyko/aF74IrB^df*.67Ufm=7)?w=!5J*q%W1hQ0+cWvzr]M]#ly1At)GR1HlgT&MQXmB{7ow9[Hb#ek-]8ej%*s?#<w]8!Rx3}?<Fz+p}v$]O@v?K($iW*t@I",
      { standard: "Z85" },
    ),
  ),
) as { "astrodon.config.ts": Uint8Array, "default.template.b.ts": Uint8Array, "demo.ts": Uint8Array, "readme.md": Uint8Array, renderer: { "index.html": Uint8Array }, "template_manifest.json": Uint8Array };
