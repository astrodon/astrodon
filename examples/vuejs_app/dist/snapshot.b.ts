import { decode } from "https://deno.land/std@0.92.0/encoding/ascii85.ts";
import { decompress } from "https://deno.land/x/brotli@v0.1.4/mod.ts";
import { parse } from "https://raw.githubusercontent.com/trgwii/bundler/master/parse.ts";
export default await parse(
  decompress(
    decode(
      "8$Byq-q!e(r#-W=D/1=!.5:}sHFtAXtvu%N9HH10Qd-$iSNB(yZCej[e0gKBK:T<{)j:/Paj&Fy!>1?zn$/m9.J}cj4?g!&lg8^qNODTN*PE-cRhwi+z8$zOzwFU82gZX=vYpD>[Jfai^iWXb&-8aEgAajV4WfRZTP:UP>=<M6v]Oepha#RQ[YeG8tX<)yXf5#qI{.+*Oq@<Oh5j)/S#I:/ey/F3R^mt0Ml.3TAnIQ-7E1/^wI7CQL8QQ(9sIbI^m#54k{+0G=tGXCiZp{iZKe(qVcT-!nJow%Q)#GDM2&70-k.oLNCS#FzJ@svtDQneXk6n4<DtwvGvtMBjufg-N^LS5ZcKs}R7E6t&^W:W*.M{tGyRl>/ZO4*5}tOhkCtI<x@m&lt3*JTs8waZ&ydPt:iN-=6GuKtq[BWCyQn%7qtqT-h*{R*O^uo=<dncaq{GWLKhXKh7?7$h3/{.vI9ee)Fi^09<varfy%z4]m%&io+V-8QzD%Eh]dNbc?fC1@EdVCEDx1BFD*Z5HIiafgHqG*w8xqAJ=FQk:LDz}M:KX7PiYoEjsJ3z*oe3CjPS3]zA#f+f:oor97[(YF[h9}f6d%+L7L3%/{gUsZI5FnY8{SX6kmrt{8b9wJ:}ror}OCGa-s&hoT)M.pQs?wgpR]z8(J7iS<t<5c2o>&lHIw-UpN1[+>MpcGt^Acy[87m@k*{@JUX?O%HF}#/L4BZqmgy+nxs[gQiSX>@p1R9CLIkpcLWWpd!%-/AA!26{Yd0/j.2do#l>K)Z>B=-ud]y*48x4)orBjhDpT97HiJQ($-pk[glJ1^VPs@Tij)3aT=@QMAXuiE0pa6#/joRAIN&Om7b.QJcLFY9l[fQ%se%<XsUt^B3Mo.AUTvjD.XwFtwVw]vHwFr>peNZ@(q$=w!?IgL7M*NUzxeSq3xRTST0fOoTR3pjChweJMv$Wl]d$GbbGOCz6XZ0.FcDcP9rha%-Wa-CpHKNz0&zW:V::]QHHFVtu7q5(.3HaZa@)h(!WQ?kX/RgyZ+eqj)Mk(.l[dFtsBd14zufua@mAT/q8[<j+/yj<tH6Z%k<sBI}9VU(p*ny!#zCEz)tVCMwXl])!X?6:*T^1L<w+9SG^p^1eAC$pFJP!9XWqS8/=[bgcup/49{KzsUsc.*ruA^#X[pD5(xW@T!JGHVM7^$5Pz^3k/-f.[uv>th#MS5.6?!K6?JmM7zjCd0wXk(4wN8WF-KCj.n)F3xcK.KCPQL{zuQ.hA7+=BC#Mpp@QviuV95+=YAeh@6qXs8cM!co.IuZkcv9$g#JH4Y3N&1k:JoCQsiO5N6-b+%9X8a71g3J9Z+nlFTjBs.b-0@VBJ^vFRrYv-LN",
      { standard: "Z85" },
    ),
  ),
) as { "App.js": Uint8Array, components: { "Button.js": Uint8Array, "Header.js": Uint8Array }, "index.html": Uint8Array, "main.css": Uint8Array, "main.js": Uint8Array, "router.js": Uint8Array, views: { "About.js": Uint8Array, "Home.js": Uint8Array } };
