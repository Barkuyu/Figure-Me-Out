import sys,os
d=os.path.dirname(os.path.abspath(__file__))
files=['01_core.js','02_gl.js','03_world.js','03b_maps.js','03c_mall.js','04_avatar.js','05_game.js','07_net.js','06_ui.js']
js="(function(){\n"+"\n".join(open(f"{d}/src/{f}",encoding='utf-8').read() for f in files)+"\n})();"
t=open(f"{d}/src/index.template.html",encoding='utf-8').read()
out=t.replace("/*GAMEJS*/",js.replace("</script>","<\\/script>"))
os.makedirs(f"{d}/out",exist_ok=True)
open(f"{d}/out/index.html","w",encoding='utf-8').write(out)
print("built",len(out)//1024,"KB")
