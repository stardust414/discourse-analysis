import struct,hashlib,json
from pathlib import Path
u16=lambda b,o:struct.unpack_from('<H',b,o)[0]
u32=lambda b,o:struct.unpack_from('<I',b,o)[0]
def sha(b):return hashlib.sha256(b).hexdigest()
def inspect(file):
 b=Path(file).read_bytes();assert b[:2]==b'MZ';pe=u32(b,0x3c);assert b[pe:pe+4]==b'PE\0\0';machine=u16(b,pe+4);count=u16(b,pe+6);opt=pe+24;magic=u16(b,opt);assert magic in [0x10b,0x20b];data=opt+(112 if magic==0x20b else 96);sec=opt+u16(b,pe+20)
 sections=[]
 for i in range(count):
  o=sec+i*40;sections.append((u32(b,o+12),max(u32(b,o+8),u32(b,o+16)),u32(b,o+20)))
 def offset(rva):
  for va,size,raw in sections:
   if va<=rva<va+size:return raw+rva-va
  raise ValueError('Unmapped RVA '+str(rva))
 resourceRva=u32(b,data+2*8);root=offset(resourceRva);resources=[]
 def walk(pos,ids):
  for i in range(u16(b,pos+12)+u16(b,pos+14)):
   key,target=struct.unpack_from('<II',b,pos+16+i*8)
   if key&0x80000000:
    q=root+(key&0x7fffffff);key=b[q+2:q+2+u16(b,q)*2].decode('utf-16le')
   if target&0x80000000:walk(root+(target&0x7fffffff),ids+[key])
   else:
    q=root+target;rva,length=struct.unpack_from('<II',b,q);off=offset(rva);resources.append((ids+[key],b[off:off+length]))
 walk(root,[]);strings={};fixed=[]
 def block(blob,pos=0):
  if pos+6>len(blob):return
  length,valueLength,kind=struct.unpack_from('<HHH',blob,pos)
  if length<6 or pos+length>len(blob):return
  q=pos+6;start=q
  while q+2<=pos+length and blob[q:q+2]!=b'\0\0':q+=2
  key=blob[start:q].decode('utf-16le');q=(q+2+3)&~3;size=valueLength*(2 if kind==1 else 1)
  value=blob[q:q+size]
  if key=='VS_VERSION_INFO' and len(value)>=24:
   assert u32(value,0)==0xfeef04bd
   def version(ms,ls):return '.'.join(str(x)for x in [ms>>16,ms&65535,ls>>16,ls&65535])
   fixed.append({'fileVersion':version(u32(value,8),u32(value,12)),'productVersion':version(u32(value,16),u32(value,20))})
  elif kind==1 and valueLength:strings[key]=value.decode('utf-16le').rstrip('\0')
  q=(q+size+3)&~3
  while q+6<=pos+length:
   childLength=u16(blob,q)
   if childLength<6:break
   block(blob,q);q=(q+childLength+3)&~3
 for ids,blob in resources:
  if ids[0]==16:block(blob)
 icons=[sha(blob)for ids,blob in resources if ids[0]==3];groups=[len(blob)for ids,blob in resources if ids[0]==14]
 return {'path':str(file),'bytes':len(b),'sha256':sha(b),'machine':hex(machine),'architecture':{0x14c:'i386',0x8664:'x86-64'}.get(machine),'optionalHeaderMagic':hex(magic),'fixedVersions':fixed,'versionStrings':strings,'iconCount':len(icons),'groupIconResourceSizes':groups,'iconHashes':icons,'authenticodeDirectoryBytes':u32(b,data+4*8+4)}
exe=Path('dist/t2-zh-Hant-win/Discourse Analysis 3.3.1 x64 Portable.exe');app=Path('scratch/t2/win-portable-extracted/Discourse Analysis.exe')
report={'outerLauncher':inspect(exe),'innerApplication':inspect(app)}
ico=Path('dist/t2-zh-Hant-win/.icon-ico/icon.ico').read_bytes();assert u16(ico,2)==1
images=[]
for i in range(u16(ico,4)):
 o=6+i*16;size=u32(ico,o+8);offset=u32(ico,o+12);images.append(sha(ico[offset:offset+size]))
report['configuredIcon']={'path':'build/icon.png','generatedIcoImages':len(images),'allImagesEmbeddedInApplication':all(h in report['innerApplication']['iconHashes'] for h in images)}
assert report['innerApplication']['architecture']=='x86-64';assert report['configuredIcon']['allImagesEmbeddedInApplication'];assert report['innerApplication']['versionStrings']['ProductName']=='Discourse Analysis';assert all(v['productVersion']=='3.3.1.0'for v in report['innerApplication']['fixedVersions'])
Path('scratch/t2/pe-inspection.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
