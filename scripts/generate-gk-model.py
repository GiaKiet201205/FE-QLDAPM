"""Generate the original, texture-free GK learning emblem as Blender-compatible GLB.
Run from the FE project: python3 scripts/generate-gk-model.py
No third-party Python dependencies or external model assets are required.
"""
import json
import math
import struct
from pathlib import Path

materials = [
    ('GK navy', [0.07, 0.16, 0.29, 1]),
    ('GK teal', [0.025, 0.46, 0.43, 1]),
    ('Warm paper', [0.98, 0.94, 0.83, 1]),
    ('Golden detail', [0.97, 0.66, 0.24, 1]),
    ('Page edge', [0.85, 0.84, 0.74, 1]),
    ('Mint ink', [0.32, 0.67, 0.59, 1]),
]
meshes = []

def sub(a, b): return tuple(x-y for x,y in zip(a,b))
def cross(a,b): return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def unit(v):
    length = math.sqrt(dot(v,v))
    return tuple(x/length for x in v)

def solid(name, vertices, faces, material):
    center = tuple(sum(v[i] for v in vertices)/len(vertices) for i in range(3))
    positions, normals = [], []
    for face in faces:
        pts = [vertices[i] for i in face]
        n = unit(cross(sub(pts[1],pts[0]),sub(pts[2],pts[0])))
        fc = tuple(sum(p[i] for p in pts)/len(pts) for i in range(3))
        if dot(n,sub(fc,center)) < 0:
            pts.reverse()
            n = tuple(-v for v in n)
        for i in range(1,len(pts)-1):
            for v in [pts[0],pts[i],pts[i+1]]:
                positions.extend(v)
                normals.extend(n)
    meshes.append((name, positions, normals, material))

faces = [(0,1,2,3),(4,5,6,7),(0,4,7,3),(1,5,6,2),(0,1,5,4),(3,2,6,7)]
def wedge(name,x0,x1,y0,y1,z0,z1,thickness,material):
    vertices=[(x0,y0-thickness,z0),(x1,y1-thickness,z0),(x1,y1-thickness,z1),(x0,y0-thickness,z1),
              (x0,y0,z0),(x1,y1,z0),(x1,y1,z1),(x0,y0,z1)]
    solid(name,vertices,faces,material)

def box(name, center, scale, material, yaw=0):
    x,y,z=center;w,h,d=scale
    vertices=[]
    for a,b,c in [(-1,-1,-1),(1,-1,-1),(1,-1,1),(-1,-1,1),(-1,1,-1),(1,1,-1),(1,1,1),(-1,1,1)]:
        dx,dz=a*w/2,c*d/2
        vertices.append((x+dx*math.cos(yaw)+dz*math.sin(yaw),y+b*h/2,z-dx*math.sin(yaw)+dz*math.cos(yaw)))
    solid(name,vertices,faces,material)

def cylinder(name,a,b,radius,material,segments=20):
    axis=unit(sub(b,a));seed=(0,0,1) if abs(axis[2])<0.9 else (1,0,0)
    u=unit(cross(axis,seed));v=cross(axis,u)
    vertices=[]
    for origin in [a,b]:
        for i in range(segments):
            angle=math.tau*i/segments
            vertices.append(tuple(origin[j]+radius*(u[j]*math.cos(angle)+v[j]*math.sin(angle)) for j in range(3)))
    surface=[tuple(range(segments)),tuple(range(segments,segments*2))]
    surface += [(i,(i+1)%segments,(i+1)%segments+segments,i+segments) for i in range(segments)]
    solid(name,vertices,surface,material)

cylinder('Navy presentation plinth',(0,-0.1,0),(0,0.04,0),1.42,0,40)
cylinder('Gold plinth trim',(0,0.035,0),(0,0.064,0),1.42,3,40)
cylinder('Teal plinth top',(0,0.063,0),(0,0.09,0),1.37,1,40)
for side in [-1,1]:
    x0,x1=(-1.16,-0.025) if side==-1 else (0.025,1.16)
    y0,y1=(0.42,0.22) if side==-1 else (0.22,0.42)
    wedge(f'{side} teal book cover',x0,x1,y0,y1,-0.76,0.76,0.065,1)
    for layer in range(4):
        offset=0.025+layer*0.025
        wedge(f'{side} paper layer {layer}',x0+0.035,x1-0.035,y0+offset,y1+offset,-0.71,0.71,0.021,2 if layer%2 else 4)
    # Abstract print on the open pages, no fonts or image textures.
    for line in range(4):
        z=-0.38+line*0.21
        left,right=(-0.94,-0.23) if side==-1 else (0.23,0.94)
        top=lambda x: 0.22+abs(x)/1.135*0.2+0.106
        wedge(f'{side} page line {line}',left,right,top(left),top(right),z,z+0.028,0.005,5)
box('Front GK nameplate',(0,0.27,0.775),(0.66,0.27,0.045),0)
# GK lettering drawn as gold strokes on the front nameplate.
for name,a,b in [
    ('G top',(-0.24,0.35,0.803),(-0.08,0.35,0.803)),('G left',(-0.24,0.35,0.803),(-0.24,0.19,0.803)),
    ('G bottom',(-0.24,0.19,0.803),(-0.08,0.19,0.803)),('G right',(-0.08,0.19,0.803),(-0.08,0.27,0.803)),
    ('G middle',(-0.08,0.27,0.803),(-0.15,0.27,0.803)),('K stem',(0.06,0.18,0.803),(0.06,0.36,0.803)),
    ('K upper',(0.06,0.27,0.803),(0.23,0.36,0.803)),('K lower',(0.06,0.27,0.803),(0.23,0.18,0.803)),
]: cylinder(name,a,b,0.013,3,8)
cylinder('Graduation cap crown',(0,1.1,-0.08),(0,1.42,-0.08),0.38,0,24)
box('Graduation cap board',(0,1.45,-0.08),(1.42,0.085,1.42),0,math.pi/4)
cylinder('Cap top button',(0,1.49,-0.08),(0,1.52,-0.08),0.075,3,12)
cylinder('Tassel cord',(0,1.53,-0.08),(0.91,1.51,0.1),0.018,3,10)
cylinder('Tassel hanging',(0.91,1.51,0.1),(0.98,0.94,0.1),0.018,3,10)
cylinder('Tassel gold end',(0.98,0.94,0.1),(0.99,0.74,0.1),0.05,3,12)
for x,y,size in [(-1.16,1.36,0.15),(1.22,1.93,0.12),(-0.58,2.08,0.08)]:
    box('Floating golden diamond',(x,y,-0.03),(size,size,0.07),3,math.pi/4)

blob=bytearray(); views=[];accessors=[];gltf_meshes=[]
def attribute(data,kind):
    while len(blob)%4:blob.append(0)
    offset=len(blob);blob.extend(struct.pack('<'+'f'*len(data),*data))
    view=len(views);views.append({'buffer':0,'byteOffset':offset,'byteLength':len(data)*4,'target':34962})
    count=len(data)//3
    accessor={'bufferView':view,'componentType':5126,'count':count,'type':'VEC3'}
    if kind=='POSITION':
        accessor['min']=[min(data[i::3]) for i in range(3)]
        accessor['max']=[max(data[i::3]) for i in range(3)]
    idx=len(accessors);accessors.append(accessor);return idx
for name,positions,normals,material in meshes:
    p=attribute(positions,'POSITION');n=attribute(normals,'NORMAL')
    gltf_meshes.append({'name':name,'primitives':[{'attributes':{'POSITION':p,'NORMAL':n},'material':material}]})
doc={'asset':{'version':'2.0','generator':'GK Academy original procedural emblem'},'scene':0,'scenes':[{'nodes':list(range(len(meshes)))}],
     'nodes':[{'mesh':i,'name':m[0]} for i,m in enumerate(meshes)],'meshes':gltf_meshes,
     'materials':[{'name':name,'pbrMetallicRoughness':{'baseColorFactor':[*(channel/12.92 if channel <= 0.04045 else ((channel+0.055)/1.055)**2.4 for channel in color[:3]), color[3]],'metallicFactor':0.3 if i==3 else 0,'roughnessFactor':0.55 if i==3 else 0.8}} for i,(name,color) in enumerate(materials)],
     'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors}
js=json.dumps(doc,separators=(',',':')).encode();js+=b' '*((-len(js))%4);blob+=b'\0'*((-len(blob))%4)
output=struct.pack('<III',0x46546c67,2,12+8+len(js)+8+len(blob))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(blob),0x004e4942)+blob
path=Path(__file__).resolve().parents[1]/'public/models/gk-learning-emblem.glb';path.parent.mkdir(exist_ok=True)
path.write_bytes(output)
print(f'{path.name}: {len(output):,} bytes, {sum(len(m[1])//9 for m in meshes)} triangles')
