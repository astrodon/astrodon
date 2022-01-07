import { decode } from "https://deno.land/std@0.92.0/encoding/ascii85.ts";
import { decompress } from "https://deno.land/x/brotli@v0.1.4/mod.ts";
import { parse } from "https://raw.githubusercontent.com/trgwii/bundler/master/parse.ts";
export default await parse(
  decompress(
    decode(
      "8}LF#-p8fyZ>OP-z.u)xCn!OdHYQ*98p(EG/T<gBM8msbRFyjV!}*4DK%h^Obysuz{$>0Gc0v1<YCaLCcU%ppPr27kGAGY#+E+xcsAP2-sr}1qB:0I^s(VX2y+?^vpezHZ3Q6a&N{cMCRH$Y*^Es9nel]s}+i3HnGM8R4d$]K:fs^GS+ZW(h/xNb5-P7A4//xD=73#tg<X*6hTgZquV0l3*csj#}CQ<9Q3HI^az#R+MctRaG8(OIaa63M?rA//+Dg$7Mnig8e=oATDzq#z{/nC2Bs4fs62HR)]TH+Y1kJWf@G8qU=<EiYxea9#[tCL^q+8*pQk0]$Ze%<f/VFR0=aTU5+-$(%YmwC:fWBt9?lsxX%bwFlq=kMvq/yrB.>jTrDpP7Q+j6*nF<IwK$!FYJf0t5T6UW}ns{)DChe<wdLVx7<0gO>EU*!.D7DD*IWrcw4*SA0x-Fu!v2gao45VZ&.<OaJT<kfs>uJDe)l]Fam>gPAJ^IAn15oY-XFj}Hf1(H>50Ek@QsLzii*TY.5Q.}HnE:G&SR]qhVtA{PBzTRB)aA=EiOBBTVm3bp}X&&:%<FIcddnqrUauwAb*IAKcBH^}.?pc>grlXOu77@9TTtm*8Ua#=l^F=hxCoW)3U[LvSA[GXUiVI0r6PnX+$Q)m=c2@uB$Fo473yizg:7O#AXT#*TeVpng1qlHyIh()ejIKhd/ye%Al2Ji6BY+ljeUyA#-19.c#y.?=Ere38K!SNCxO>Gf20eX4OBB!$R^o0{Z^0qaow4PlEj%FvU&aOo%vuM9UBo^Cjj8SSHw0fptQKNzdB%z-CYLpgrv?zWhrB4yR5rty1(w#r[ipUG7)m]@?7SwPSIxG3}(](iPqMHZ)1F[$kkc2GQkg>hkiu9&n?F58Ngwwg[W.bsC]fV#V!w$t}GISPe^Gn=>27)Y4o=f@VI&Zz<5w]lUvF!gKdzA7wDKC602CJ-26fpNV>=ncG6fTri10{Q&b-5$m]2<t.qX=euM^sqP2do8jM<>7ReuTJc]rJ>:k9b2fk@qShWApO(GjZLscKZOcBbh4=-Jt:aCT)b@2J2G=M0D=%mJJLRnWyrksI-ZiR:T+6G6Ptsu3suuUpWj/LP--vy*(I*xE!IE4#A(u%g@P^.RxV<U@81wL6^iDw2wt!NnfW>trH>{0q5mRfQLSjFjkQj(}eS$]cFdoEjS[=(V&tPW!zb5gO:creQbm}E.}@hueaSp}#yPApUCa!j$@=IGh0wY:p4K@^j?zVK$0!uZ[Z}w7%Q.i7zBmMs6YW=*gPHOOhTVI9REEp3ef<Ox8ATsc*#mx7L*4u9ax6?U)q@x0b2oD4H)Ob[935^BY/+[AeNf6=D>K}W4BIXw^[",
      { standard: "Z85" },
    ),
  ),
) as { "App.js": Uint8Array, components: { "Button.js": Uint8Array, "Header.js": Uint8Array }, "index.html": Uint8Array, "main.css": Uint8Array, "main.js": Uint8Array, "router.js": Uint8Array, views: { "About.js": Uint8Array, "Home.js": Uint8Array } };
