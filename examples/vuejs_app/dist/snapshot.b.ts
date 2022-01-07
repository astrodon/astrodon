import { decode } from "https://deno.land/std@0.92.0/encoding/ascii85.ts";
import { decompress } from "https://deno.land/x/brotli@v0.1.4/mod.ts";
import { parse } from "https://raw.githubusercontent.com/trgwii/bundler/master/parse.ts";
export default await parse(
  decompress(
    decode(
      "8}>Y2-q!DNtE@1Z?>H[zEb[sw:0u8m4y1SwO?oE]yNcN3NR*fc}.+9YIkiX4*(}cH1E5/y8ynJhlgW#/M7CiqW5$ibc>33nnZt8=CuP0j5!^c6DyJ!RUugHm2B?!=W?(c[+-<9-LH2ka}EQV%=6<w.tU0:{TQ)xb1%(V2@n8bvG7>cs^#RF**?Xjr57t^2hz0O4FGQZdo?d5Q?0O?$oLZ.g)#w6+-)VFh0*=l5{X]t2dkY.>AYVJzE1a#zd}Joz80j4xz:}[BS}MADk}9+tXvtY7yR1n3.*u6=j!rnqHl4z>?cxG0S%c8[uc>E$f)Dfw+QskIKL<P3P.R.+CoZUkpDI20.-b:!(=l29}T@0REtQIL{&vM)u2M)e}T7uUd=6Q/Ff56}Wn[!-KRu/(O:MdPkudZ}u[X-}yw?[G+$Z#k@Tf*mD[kz(38@C{?9@6w8:rQUMU^oJt[#E9[hx3i5-?z{0z:J)*WDR80t:uT(=4P22fn][scN$ea:4mrKKw8b@3Eq=K^!!+ElIf=xf{iuvxz([NyoLioQk^DNM>sNT[@4Y.wIowtp.A{H8##>}L7f=Hy!oToT>DO2-RgXpQu!G6#A+Z1)uMttsj{S!kdH:d8[7r(1S4^VDR$&m{]oW1YEb?jn^#TbaEZ7VT!c+++{(W<fXwd3yW8nL%z:#x*6jjO0O?@&oLL>(%7}(kiX[{7kFDOWpSe[oS.6x1onYz*e!q}hUQ20ebln=2]=rx^Pj+Gc%HC?Y6gUK4::j9xh{83UM9d#2jxdGLGUNhG:OA#e.DK@Yu[X+4z4hdTNjQ&<TFp}[=3pT?[b2^9CeN99ttbmdc:X$FJH.EZEqtIw+/mF<DDa$duYgx5fYn(yr5.qH?c(&QTl(rxlLuy3%NHK4?Z8fizSLC>anD]WZR}IU1N=rng+0h2.=cueX)w{fI4sch>t}s5Z>s]QpVdpemhy4-5z(p)/k1GlRN8Vh7^z?<KHSSV7x@alcnm72%uG+?e<k8BCQ)>!HIz#l2BvUN.#]}O83uZE+AE=Pu?X^ar24*o6Et!k}lKg8ac*h9n<jXAJ7t8*Hvs}UN5r[zy4u<}cZ9fypnWVL$P1Ry7fzyTuRZjA-f0(^^RBrmf}u#uZ:AC)J4b*LWA7G/qGTIfk:H%ZtM?S--Myk%i98z51yjtP8^}iW:Vc>DYJ:2T-*/!cc.nJI-}]JN@{M9jJz/l.JAmp/PJc.T%WE8!WpV%=KVa({GqPZHU&IOmsS!4d6=f!NdKuYa>8dL3IUbiW#[%Y4)V9b>8UnLW7hmDhp#&cpc1^kBC^J.VK]n7HSP<s:hD%87}XA^m-4I2iLVWJUTwvf-x7P73Z)p>>?/?ZIhI:>h%L0FZG{{",
      { standard: "Z85" },
    ),
  ),
) as { "App.js": Uint8Array, components: { "Button.js": Uint8Array, "Header.js": Uint8Array }, "index.html": Uint8Array, "main.css": Uint8Array, "main.js": Uint8Array, "router.js": Uint8Array, views: { "About.js": Uint8Array, "Home.js": Uint8Array } };
