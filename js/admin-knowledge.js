// ═══════════════════════════════════════════════════════════════
// ArjunaFit — Admin Knowledge Center for Arju IA
// Manages arju_knowledge_documents + chunks in Supabase
// admin-arju-knowledge-center-v1
// ═══════════════════════════════════════════════════════════════
(function() {
  'use strict';

  var sb = null;
  var _currentType = 'text';
  var _knDocs      = [];

  // ── Bootstrap: get Supabase client ─────────────────────────────
  function getSB() {
    return window._sb || window.supabaseClient || window.AF_SUPABASE || null;
  }

  // ── Set content type (text vs file) ────────────────────────────
  window.knSetType = function(type) {
    _currentType = type;
    var isFile = (type === 'file');

    var btnText = document.getElementById('kn-type-text');
    var btnFile = document.getElementById('kn-type-file');
    var areaText = document.getElementById('kn-text-area');
    var areaFile = document.getElementById('kn-file-area');

    if (btnText) {
      btnText.style.background   = isFile ? 'transparent' : 'rgba(139,92,246,.25)';
      btnText.style.color        = isFile ? 'rgba(255,255,255,.45)' : '#c4b5fd';
      btnText.style.borderColor  = isFile ? 'rgba(255,255,255,.1)' : 'rgba(167,139,250,.5)';
    }
    if (btnFile) {
      btnFile.style.background   = isFile ? 'rgba(139,92,246,.25)' : 'transparent';
      btnFile.style.color        = isFile ? '#c4b5fd' : 'rgba(255,255,255,.45)';
      btnFile.style.borderColor  = isFile ? 'rgba(167,139,250,.5)' : 'rgba(255,255,255,.1)';
    }
    if (areaText) areaText.style.display = isFile ? 'none' : 'block';
    if (areaFile) areaFile.style.display = isFile ? 'block' : 'none';

    // File input change → preview
    var fileInput = document.getElementById('kn-file');
    if (fileInput && isFile) {
      fileInput.onchange = function() {
        var file = fileInput.files[0];
        var preview = document.getElementById('kn-file-preview');
        if (!file || !preview) return;
        if (file.size > 512000) {
          preview.style.display = 'block';
          preview.textContent = '⚠️ Archivo demasiado grande (máx 500KB)';
          preview.style.color = '#fca5a5';
          fileInput.value = '';
          return;
        }
        preview.style.display = 'block';
        preview.style.color = '#86efac';
        preview.textContent = '✅ ' + file.name + ' (' + Math.round(file.size/1024) + 'KB)';
      };
    }
  };

  // ── Chunk text into pieces ──────────────────────────────────────
  function chunkText(text, category, tags) {
    var words  = text.split(/\s+/);
    var chunks = [];
    var size   = 800;   // target words per chunk
    var over   = 120;   // overlap words
    var i = 0;
    var idx = 0;
    while (i < words.length) {
      var slice = words.slice(Math.max(0, i - over), i + size);
      var content = slice.join(' ').trim();
      if (content.length > 40) {
        chunks.push({
          chunk_index:     idx++,
          content:         content,
          category:        category || 'general',
          tags:            tags || [],
          token_estimate:  Math.round(content.length / 4),
          status:          'active',
        });
      }
      i += size;
    }
    return chunks;
  }

  // ── Read file as text ───────────────────────────────────────────
  function readFile(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload  = function(e) { resolve(e.target.result); };
      reader.onerror = function()  { reject(new Error('No se pudo leer el archivo')); };
      reader.readAsText(file);
    });
  }

  // ── Set save status ─────────────────────────────────────────────
  function setStatus(msg, color) {
    var el = document.getElementById('kn-save-status');
    if (el) { el.textContent = msg; el.style.color = color || 'rgba(255,255,255,.5)'; }
  }

  // ── Save document ───────────────────────────────────────────────
  window.knSaveDocument = async function() {
    var client = getSB();
    if (!client) { setStatus('❌ Supabase no disponible', '#fca5a5'); return; }

    var title    = (document.getElementById('kn-title')?.value || '').trim();
    var category = document.getElementById('kn-category')?.value || 'general';
    var source   = (document.getElementById('kn-source')?.value || '').trim();
    var tagsRaw  = (document.getElementById('kn-tags')?.value || '').trim();
    var language = document.getElementById('kn-language')?.value || 'es';
    var tags     = tagsRaw ? tagsRaw.split(',').map(function(t) { return t.trim(); }).filter(Boolean) : [];

    if (!title) { setStatus('⚠️ El título es obligatorio', '#fbbf24'); return; }

    var content = '';
    if (_currentType === 'file') {
      var fileInput = document.getElementById('kn-file');
      var file = fileInput?.files[0];
      if (!file) { setStatus('⚠️ Selecciona un archivo', '#fbbf24'); return; }
      try { content = await readFile(file); }
      catch(e) { setStatus('❌ Error al leer archivo: ' + e.message, '#fca5a5'); return; }
    } else {
      content = (document.getElementById('kn-content')?.value || '').trim();
    }

    if (!content || content.length < 10) {
      setStatus('⚠️ El contenido está vacío', '#fbbf24'); return;
    }

    setStatus('⏳ Guardando documento…', '#a78bfa');

    try {
      // 1. Save document record
      var docPayload = {
        title:             title,
        category:          category,
        description:       'Cargado desde Admin Knowledge Center',
        source_type:       _currentType === 'file' ? 'file' : 'manual',
        source_name:       source || 'ArjunaFit Admin',
        tags:              tags,
        language:          language,
        status:            'active',
        original_filename: _currentType === 'file' ? (document.getElementById('kn-file')?.files[0]?.name || null) : null,
      };

      var { data: doc, error: docErr } = await client
        .from('arju_knowledge_documents')
        .insert(docPayload)
        .select('id')
        .single();

      if (docErr) throw new Error(docErr.message);
      var docId = doc.id;

      // 2. Chunk content
      setStatus('⏳ Procesando chunks…', '#a78bfa');
      var chunks = chunkText(content, category, tags);

      // 3. Save chunks in batches of 10
      var batchSize = 10;
      for (var b = 0; b < chunks.length; b += batchSize) {
        var batch = chunks.slice(b, b + batchSize).map(function(c) {
          return Object.assign({ document_id: docId }, c);
        });
        var { error: chunkErr } = await client
          .from('arju_knowledge_chunks')
          .insert(batch);
        if (chunkErr) console.warn('[Knowledge] chunk batch error:', chunkErr.message);
      }

      setStatus('✅ Guardado: ' + chunks.length + ' chunks procesados', '#86efac');

      // 4. Reset form
      if (document.getElementById('kn-title'))   document.getElementById('kn-title').value = '';
      if (document.getElementById('kn-content')) document.getElementById('kn-content').value = '';
      if (document.getElementById('kn-source'))  document.getElementById('kn-source').value = '';
      if (document.getElementById('kn-tags'))    document.getElementById('kn-tags').value = '';
      if (document.getElementById('kn-file'))    document.getElementById('kn-file').value = '';

      // 5. Refresh list
      setTimeout(function() { knLoadDocuments(); knLoadStats(); }, 600);
    } catch(e) {
      console.error('[Knowledge] save error:', e);
      setStatus('❌ Error: ' + e.message, '#fca5a5');
    }
  };

  // ── Load documents list ─────────────────────────────────────────
  window.knLoadDocuments = async function() {
    var client = getSB();
    var cont = document.getElementById('kn-docs-list');
    if (!cont) return;
    if (!client) { cont.innerHTML = '<div style="color:#fca5a5;font-size:12px">Supabase no disponible</div>'; return; }

    cont.innerHTML = '<div style="color:rgba(255,255,255,.3);font-size:12px">Cargando…</div>';

    try {
      var { data, error } = await client
        .from('arju_knowledge_documents')
        .select('id,title,category,status,tags,created_at,source_name')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);
      _knDocs = data || [];

      if (!_knDocs.length) {
        cont.innerHTML = '<div style="color:rgba(255,255,255,.3);font-size:12px;text-align:center;padding:20px">No hay documentos todavía.<br>Agrega el primero arriba.</div>';
        return;
      }

      var CAT_COLORS = {
        brand_voice:'rgba(168,85,247,.2)', commercial_rules:'rgba(245,197,66,.15)',
        training:'rgba(59,130,246,.15)', nutrition:'rgba(34,197,94,.12)',
        recipes:'rgba(236,72,153,.12)', safety:'rgba(239,68,68,.12)',
        support:'rgba(99,102,241,.15)', objections:'rgba(251,146,60,.12)',
        general:'rgba(255,255,255,.06)',
      };

      cont.innerHTML = _knDocs.map(function(d) {
        var color = CAT_COLORS[d.category] || CAT_COLORS.general;
        var date  = new Date(d.created_at).toLocaleDateString('es-CO', {day:'numeric',month:'short'});
        var statusBadge = d.status === 'active'
          ? '<span style="font-size:9px;padding:2px 7px;border-radius:6px;background:rgba(34,197,94,.15);color:#86efac">Activo</span>'
          : '<span style="font-size:9px;padding:2px 7px;border-radius:6px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.35)">Inactivo</span>';

        return '<div style="padding:12px;background:' + color + ';border:1px solid rgba(255,255,255,.07);border-radius:11px;margin-bottom:8px">' +
          '<div style="display:flex;justify-content:space-between;align-items:start;gap:8px">' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-size:12px;font-weight:700;color:#f5f3ff;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + d.title + '</div>' +
              '<div style="font-size:10px;color:rgba(255,255,255,.4)">' + d.category.replace(/_/g,' ') + ' · ' + date + '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0">' +
              statusBadge +
              '<button onclick="knToggleDoc(\'' + d.id + '\',\'' + d.status + '\')" ' +
                'style="padding:3px 8px;font-size:9px;border-radius:6px;border:1px solid rgba(255,255,255,.1);' +
                'background:rgba(255,255,255,.05);color:rgba(255,255,255,.5);cursor:pointer">' +
                (d.status === 'active' ? 'Desactivar' : 'Activar') +
              '</button>' +
              '<button onclick="knDeleteDoc(\'' + d.id + '\')" ' +
                'style="padding:3px 8px;font-size:9px;border-radius:6px;border:1px solid rgba(239,68,68,.2);' +
                'background:rgba(239,68,68,.07);color:rgba(252,165,165,.7);cursor:pointer">🗑</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    } catch(e) {
      cont.innerHTML = '<div style="color:#fca5a5;font-size:12px">Error: ' + e.message + '</div>';
    }
  };

  // ── Toggle doc active/inactive ──────────────────────────────────
  window.knToggleDoc = async function(id, currentStatus) {
    var client = getSB();
    if (!client) return;
    var newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await client.from('arju_knowledge_documents').update({ status: newStatus }).eq('id', id);
    // Also update chunks
    await client.from('arju_knowledge_chunks').update({ status: newStatus }).eq('document_id', id);
    knLoadDocuments(); knLoadStats();
  };

  // ── Archive (soft-delete) doc ───────────────────────────────────
  window.knDeleteDoc = async function(id) {
    if (!confirm('¿Archivar este documento? No se eliminará permanentemente.')) return;
    var client = getSB();
    if (!client) return;
    await client.from('arju_knowledge_documents').update({ status: 'archived' }).eq('id', id);
    await client.from('arju_knowledge_chunks').update({ status: 'inactive' }).eq('document_id', id);
    knLoadDocuments(); knLoadStats();
  };

  // ── Load stats ──────────────────────────────────────────────────
  window.knLoadStats = async function() {
    var client = getSB();
    if (!client) return;
    try {
      var { count: docCount } = await client
        .from('arju_knowledge_documents')
        .select('id', { count:'exact', head:true })
        .eq('status','active');

      var { count: chunkCount } = await client
        .from('arju_knowledge_chunks')
        .select('id', { count:'exact', head:true })
        .eq('status','active');

      var { data: lastDoc } = await client
        .from('arju_knowledge_documents')
        .select('updated_at')
        .order('updated_at', { ascending:false })
        .limit(1)
        .single();

      var el1 = document.getElementById('kn-total-docs');
      var el2 = document.getElementById('kn-total-chunks');
      var el3 = document.getElementById('kn-last-updated');
      if (el1) el1.textContent = docCount || 0;
      if (el2) el2.textContent = chunkCount || 0;
      if (el3) el3.textContent = lastDoc
        ? new Date(lastDoc.updated_at).toLocaleDateString('es-CO',{day:'numeric',month:'short'})
        : '—';
    } catch(e) {
      console.warn('[Knowledge] stats error:', e.message);
    }
  };

  // ── Test search ─────────────────────────────────────────────────
  window.knTestSearch = async function() {
    var client = getSB();
    var query  = (document.getElementById('kn-test-query')?.value || '').trim().toLowerCase();
    var mode   = document.getElementById('kn-test-mode')?.value || 'daily_coach';
    var cont   = document.getElementById('kn-test-results');
    if (!cont) return;

    if (!query) { cont.innerHTML = '<div style="color:#fbbf24;font-size:12px">Escribe una pregunta de prueba.</div>'; return; }
    if (!client) { cont.innerHTML = '<div style="color:#fca5a5;font-size:12px">Supabase no disponible.</div>'; return; }

    cont.innerHTML = '<div style="color:rgba(255,255,255,.35);font-size:12px">Buscando chunks relevantes…</div>';

    try {
      // Simple keyword search: split query into words, search content
      var keywords = query.split(/\s+/).filter(function(w) { return w.length > 3; }).slice(0, 4);

      // Build search across chunks content using ilike for each keyword
      var orFilters = keywords.map(function(kw) { return 'content.ilike.%' + kw + '%'; }).join(',');
      var { data: chunks, error } = await client
        .from('arju_knowledge_chunks')
        .select('id,content,category,document_id,token_estimate')
        .eq('status','active')
        .or(orFilters)
        .limit(5);

      if (error) throw new Error(error.message);

      // Also get static knowledge from arju-knowledge.js
      var staticKnowledge = [];
      if (window.AF_Knowledge) {
        var extraDocs = window.AF_Knowledge.retrieveFor(query, mode, '');
        extraDocs.forEach(function(docId) {
          var content = window.AF_Knowledge.getInline(docId);
          if (content) staticKnowledge.push({ docId: docId, content: content });
        });
      }

      var results = chunks || [];
      var totalFound = results.length + staticKnowledge.length;

      if (!totalFound) {
        cont.innerHTML = '<div style="color:rgba(255,255,255,.35);font-size:12px;padding:16px;text-align:center">' +
          'No se encontraron chunks. Agrega documentos sobre este tema primero.</div>';
        return;
      }

      var html = '<div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:10px">' +
        totalFound + ' chunks relevantes encontrados para: "' + query + '"</div>';

      // Static knowledge
      if (staticKnowledge.length) {
        html += '<div style="font-size:11px;font-weight:700;color:#a78bfa;margin-bottom:6px">📁 Knowledge estático (repo):</div>';
        staticKnowledge.forEach(function(sk) {
          html += '<div style="padding:10px 12px;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.2);' +
            'border-radius:10px;margin-bottom:8px">' +
            '<div style="font-size:10px;color:#a78bfa;font-weight:700;margin-bottom:4px">' + sk.docId + '</div>' +
            '<div style="font-size:11px;color:rgba(255,255,255,.65);line-height:1.5">' +
              sk.content.replace(/</g,'&lt;').substring(0,200) + '…' +
            '</div></div>';
        });
      }

      // DB chunks
      if (results.length) {
        html += '<div style="font-size:11px;font-weight:700;color:#86efac;margin:10px 0 6px">🗄️ Knowledge admin (Supabase):</div>';
        results.forEach(function(c) {
          html += '<div style="padding:10px 12px;background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.15);' +
            'border-radius:10px;margin-bottom:8px">' +
            '<div style="font-size:10px;color:#86efac;margin-bottom:4px">Categoría: ' + c.category + ' · ~' + c.token_estimate + ' tokens</div>' +
            '<div style="font-size:11px;color:rgba(255,255,255,.65);line-height:1.5">' +
              c.content.replace(/</g,'&lt;').substring(0,250) + (c.content.length > 250 ? '…' : '') +
            '</div></div>';
        });
      }

      cont.innerHTML = html;
    } catch(e) {
      cont.innerHTML = '<div style="color:#fca5a5;font-size:12px">Error: ' + e.message + '</div>';
    }
  };

  // ── Auto-load on tab show ───────────────────────────────────────
  // Hook into showTab if it exists
  document.addEventListener('DOMContentLoaded', function() {
    var origShowTab = window.showTab;
    if (typeof origShowTab === 'function') {
      window.showTab = function(id) {
        origShowTab(id);
        if (id === 'knowledge') {
          knLoadDocuments();
          knLoadStats();
        }
      };
    }
  });

  window.knLoadDocuments = window.knLoadDocuments || function(){};
  window.knLoadStats     = window.knLoadStats     || function(){};
  console.log('[AdminKnowledge] loaded v1');

})();
