/** v1.0 display/search adapter. DA_PROFILES remains the raw-data authority. */
(function () {
  const extraNames = {
    'action-manner': ['Way-End'],
    'action-purpose': ['Means-End'],
    'action-result': ['cause-effect'],
    concessive: ['Adversative']
  };
  const groupKeys = {
    'COORDINATE RELATIONSHIPS': 'group.coordinate',
    'SUBORDINATE RELATIONSHIPS': 'group.subordinate',
    'Support by Restatement': 'group.restatement',
    'Support by Distinct Statement': 'group.distinct',
    'Support by Contrary Statement': 'group.contrary',
    'OTHER RELATIONSHIPS': 'group.other'
  };
  const bare = (name) => name.replace(/\s*\([^)]*\)\s*$/, '').trim();

  function variant(type) {
    const t = DA_PROFILES.effectiveType(type);
    const name = bare(DA_PROFILES.getName(t));
    return (extraNames[t] || []).find((candidate) => candidate === name ||
      candidate === 'cause-effect' && name === 'Cause-Effect') || t;
  }

  function getName(type) {
    const t = DA_PROFILES.effectiveType(type);
    const raw = DA_PROFILES.getName(t);
    if (t.startsWith('cl_')) {
      const custom = [...(DA_STATE.customLabels || []), ...(DA_STATE.savedCustomLabels || [])].find((item) => item.id === t);
      return custom ? `${custom.name} (${custom.label})` : raw;
    }
    const active = DA_PROFILES.getActive();
    const builtin = active.builtin && DA_PROFILES.builtins()[active.id];
    if (!builtin) return raw;
    const original = builtin.labels[t]?.name || DA_CONSTANTS.RELATIONSHIP_LABELS[t];
    // An imported or manually modified builtin flag must not translate a rename.
    if (!original || raw !== original) return raw;
    const key = 'relationship.name.' + variant(t);
    if (!Object.prototype.hasOwnProperty.call(window.DA_I18N_CATALOGS.en, key)) return raw;
    return DA_I18N.t(key) + raw.slice(bare(raw).length);
  }

  function getDefinition(type) {
    const original = DA_CONSTANTS.RELATIONSHIP_DEFINITIONS[type]?.definition || '';
    const key = 'relationship.definition.' + variant(type);
    return Object.prototype.hasOwnProperty.call(window.DA_I18N_CATALOGS.en, key)
      ? DA_I18N.t(key) : original;
  }

  function searchTerms(type) {
    const names = [type, ...(extraNames[type] || [])];
    const zh = window.DA_I18N_CATALOGS['zh-CN'];
    return names.map((name) => zh['relationship.name.' + name]).filter(Boolean);
  }

  function searchKeywords(type) {
    const zh = window.DA_I18N_CATALOGS['zh-CN'];
    return [type, ...(extraNames[type] || [])]
      .map((name) => zh['relationship.definition.' + name]).filter(Boolean);
  }

  window.DA_RELATIONSHIPS = {
    getName, getDefinition, searchTerms, searchKeywords,
    getGroupName: (name) => groupKeys[name] ? DA_I18N.t(groupKeys[name]) : name
  };
})();
