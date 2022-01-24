import { decode } from "https://deno.land/std@0.92.0/encoding/ascii85.ts";
import { decompress } from "https://deno.land/x/brotli@v0.1.4/mod.ts";
import { parse } from "https://raw.githubusercontent.com/trgwii/bundler/master/parse.ts";
export default await parse(
  decompress(
    decode(
      "8)xOF-q!5H1-$6@UprVhALv:Wdf9Q.cdTyIne!.C<IOVjBns<&TZZl.7CmIMM.YpNn:ljO(hVJJoqC[9+gZfOXRjh4m&PKOHo>KX5%@4O7K@9-H9Uerf/lT*x8t5(4Xrn8GetW%-wth=]Y]wr0<-:$OL9(D?gK)Lcmp6L2!F#hROA?m06$F=k(qRanSp}?q/fI!tD-[}S#5%^VR5zIQJ?puw?mEfx$.hCf%Fs]OgE7otAF)HpZ>3%Bn.?oRwinJ3TnfG{LsQ}Jf=bQB!3$0sSt{R.:<z16-CL(s}2gB=6oao74BMo<aGxntD5<AQDwOs[d&K1SUI9z/D?.AC+(kQO=3[@lG%e/dv<Okz1B}E3-KP&)HwZpx%gNVbC0[SuWFZl(Au&yI1YpXc}T>6WC:THTi=Zt&hN7!ba34.pkd4KP$ae1D6W&KNRfQ/^V1x5C=@snEI$mji:TGPB(}jq*]%<MZ[llLlJvwY{tY5G>^*l@*yF%lj[@V:q2rmhoGueVJat:!@N/cii#f^=x&lT9Ghy6a@sJN-&JSGY>i$NcK]gp{haey^T88N>j+wM0Kg/&oKj13k2?=rN]#AOQ1tg=?a5X!^i7T>-v??kxeg!N)6N-=O{o=@]q4i(B^p:YCg=el}VO#?5U):54H7)%56Vss<f=pVENY)i%Kc-Tq3[pn>Pu9dT2WSpJPnrbwNSSgh6r.]t=ljI*mm39hu9EQ{w*WIaRoC5tDd:lvu!G.K^$^v5z)GcUV5.fRWY+is1fSE#SZfoBPv4Yvm:*V}4[C[bckEwWo.bplQ&W92v>Sq}92Wo<^atsV0MwOQShCGAegB-%e)97kjw^&#FiHRZW4g##N$Ozi?e>vrh0w%O0USNKzm]^yEF<!dwBo4xO$9:}X#(g=/x7U-acn(kUd=^%(-mNcyn2rr1])=yMT$B!D5k2^bp1XX/Xre&zDN2EQUm:%brE^wwJD*9KW6kQ>S&ZH-mWJ@(DstI{Rghl(zHFl{Zb*fOCwj(X-hu2UA#IigC4.141]CWfF$GeP?P3fg2sZ(mwF2Lh0&K=EeL?vXp]etf[m(u=ikwZEZ8k.Wa}ZQ8FN%6i&sd]4%*O>/6(ST9s3Vg=OrOu85i.}+#[XP+#1c}=yR/<}=Bu1Kfi*^X3wsV7#zS3C2Vm(L8sWcdLgy<4Kl>&f#BSf{o&)jq./TV&}#<&*6w++joakm3PlFd+0q+@mL?pWV0x41Ty(!(i6Frx(g1(9L7oG9tHK+]-<lMe.GVuMgsd3/?]xQW9r",
      { standard: "Z85" },
    ),
  ),
) as { "astrodon.config.ts": Uint8Array, "default.template.b.ts": Uint8Array, "mod.ts": Uint8Array, "readme.md": Uint8Array, renderer: { "index.html": Uint8Array }, "template_manifest.json": Uint8Array };
