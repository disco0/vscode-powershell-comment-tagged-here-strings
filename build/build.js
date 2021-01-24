// @ts-check
require('./generateDocs').updateDocs();
require('./generateGrammar').updateGrammars();
require('./generateEmbedded').updateEmbedded();

/**
 * @TODO
 *   Handle c# identifier for csharp here-strings (e.g. `<# c# #> @"`)
 */