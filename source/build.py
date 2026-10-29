import sys,os
d=os.path.dirname(os.path.abspath(__file__))
files=['01_core.js','02_gl.js','03_world.js','03b_maps.js','03c_mall.js','04_avatar.js','05_game.js','07_net.js','06_ui.js']
js="(function(){\n"+"\n".join(open(f"{d}/src/{f}",encoding='utf-8').read() for f in files)+"\n})();"
t=open(f"{d}/src/index.template.html",encoding='utf-8').read()
ver=open(f"{d}/version.txt").read().strip()
t=t.replace("{{VER}}",ver)
import re
def conv(m):
    css=m.group(0)
    css=re.sub(r"(?<![\w.-])(-?\d*\.?\d+)vw",lambda x:"calc(var(--vw)*%s)"%x.group(1),css)
    css=re.sub(r"(?<![\w.-])(-?\d*\.?\d+)vh",lambda x:"calc(var(--vh)*%s)"%x.group(1),css)
    return css
t=conv(re.match(r"(?s).*",t))
t=t.replace("<style>","<style>\n:root{--vw:1vw;--vh:1vh}",1)
t=t.replace("{{LOGO}}",open(f"{d}/src/logo.b64").read().strip())
out=t.replace("/*GAMEJS*/",js.replace("</script>","<\\/script>"))
os.makedirs(f"{d}/out",exist_ok=True)
open(f"{d}/out/index.html","w",encoding='utf-8').write(out)
print("built",len(out)//1024,"KB")
