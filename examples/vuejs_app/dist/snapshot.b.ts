import { decode } from "https://deno.land/std@0.92.0/encoding/ascii85.ts";
import { decompress } from "https://deno.land/x/brotli@v0.1.4/mod.ts";
import { parse } from "https://raw.githubusercontent.com/trgwii/bundler/master/parse.ts";
export default await parse(
  decompress(
    decode(
      "8&$Ed-j&a.RqEjj?*5@bE4qJ:PF/<0vqNTWE:UN>woSX[A0M]a:?qgGdHwY)L/R+rzqTc0zkYv$wrL>[n$/m9lDrGF.:2@@9ZmlmcZ#Blr#Ft6hfnldZTxJ:KJ-*u3g!1yP#VRjB8cfXnPet(5<*CAKKaj90Vm3*I4EA8=<XYBNl@TEh-5vZ*n)tCZNd}XIVN(x4=p0D0tcrVM0>3I(0u#URc6f[KG-3C4Gpy!rmnX$x4Ek!NG4R7r#-CdG7h+fP53*}D3Z9Lr2p%%OAx0#E5oUc=T^+:U{lR<w94%5?&d#@3iGY$hOZo+b.SP%:qg0:)Y(N4V42#zYq&OPYE.Y*{:TbJt%DwD)u5)j^)F?:L8!dvQ4xWiBd6Iy!(GZ/52Jktoz[)kZTZ#X[S%}(pU#F$U@IXqgJ([fIU%8epjaD8O*[1C&a+$iQuuMsK0WZ*fOR5d7BWXrpBQQ-1h*OMckTH(h#a<Fk=WrbSmBD1eBPod^{F%iI[HafX:({K5)0tdrpniwSHS*FG#fpzEAI)s9^82@7Xn#b-J[%8J&=((7uG7(5i.!rP9-nUMvM4H8iHhbhR6ko[C3MJ*y/5bXQVL<ADu-cc>gGN9&FiLEa*X&Cpf}$QZfwyj#2(3WzTO<3&JxV/[]JJK}mAeJkS>p8VbVFc7[J9jr2r:@&e{r1L]3crD=o^CBypqq=<u!hq-Kz*uJHc4/*rYuNqS$lvVS(5m199!^w{2Khth+wlAZ7X:*^@np!fd}+m/ASjR(hb0qW%uuVi?VqJqqFix168bei-YzCKs^qxFgqahFdrP.fc@R/22g3[CHh0(epJ.3:>fa$Ic*=lTNM2.%Jw<I%m3c#S}@A+*dnExeVv<V?bu1Qn%+8bkVmVG:t.vCxLPf+yFW<0?g)L8>&<XlOY(K%8[Dou.UFISA%Fe-@Bj&?F/xh{yl7!)nmr#3wi]+]aJdGz2U9DV@SPiJ+{o:$2r-7sf:mv2R-GG@YM2Z9c!-Az4+=s<#oClsL6Lg-AZ2*7w2ImGgSbVI$N[]x/3!lMf.}+nk}<7P[vJs/-Df53^o&>U1yWO1XP.Y]FdtathNzi}9cVtMXn78-rm)us7=]>M6[0I@Svf}c:m/<0gwmO.-0c?=k[<C]wjzAtB({v#9<([or]ZUzb)u/8uXj)PnkInuZOj1MnVDU.q%apy50kA$DH^.SD-z12NLmfW86a.KqCmkbDlWumMM2wtR(L<Xqv<bW!mxQ1zYnRNFvm&NCvoSvzyj=3>f?BK}%kjj>SdV4<MPxuVUx101z(E/M}8M^ec:g$/3PhQBKDn{P*rWXH*5RbMm7?0!orUrm$vm&b<13wt)/WmsyxDZj%",
      { standard: "Z85" },
    ),
  ),
) as {
  "App.js": Uint8Array;
  components: { "Button.js": Uint8Array; "Header.js": Uint8Array };
  "index.html": Uint8Array;
  "main.css": Uint8Array;
  "main.js": Uint8Array;
  "router.js": Uint8Array;
  views: { "About.js": Uint8Array; "Home.js": Uint8Array };
};
