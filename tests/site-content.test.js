import test from 'node:test';
import assert from 'node:assert/strict';
import { sortPublished, selectFeatured, normalizeAlbum, safePublicImage } from '../src/services/contentSelectors.js';

test('solamente se muestran elementos publicados y ordenados', () => {
  assert.deepEqual(sortPublished([
    {id:'uno',status:'published',updatedAtMs:1},
    {id:'borrador',status:'draft',updatedAtMs:3},
    {id:'dos',status:'published',updatedAtMs:2}
  ]).map(x => x.id), ['dos','uno']);
});

test('destacado por ID, slug, título o referencia con alternativa segura', () => {
  const items = [{id:'1',slug:'una-historia',title:'Historia uno',reference:'Romanos 12:2'},{id:'2',title:'Otra'}];
  assert.equal(selectFeatured(items,'UNA-HISTORIA')?.id,'1');
  assert.equal(selectFeatured(items,'Romanos 12:2',['id','reference'])?.id,'1');
  assert.equal(selectFeatured(items,'inexistente')?.id,'1');
  assert.equal(selectFeatured([],'inexistente'),null);
});

test('álbum admite múltiples imágenes válidas y descarta URLs no seguras', () => {
  const album = normalizeAlbum({id:'a', title:'Paisajes',images:['https://ejemplo.com/uno.jpg','javascript:alert(1)',{url:'https://ejemplo.com/dos.jpg'}]});
  assert.equal(album.count,2);
  assert.equal(album.image,'https://ejemplo.com/uno.jpg');
  assert.equal(safePublicImage('javascript:alert(1)'),'');
});
