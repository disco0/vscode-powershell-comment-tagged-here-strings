// @ts-check

const fs    = require('fs');
const path  = require('path');
const c     = require('chalk');

const { languages } = require('./languages');

const targetScopes = ['source.powershell']

const { raw } = String;

/**
 * @type {Grammar}
 */
const basicGrammarTemplate = 
{
    "fileTypes": [],
    "injectionSelector": getBasicGrammarInjectionSelector(),
    "patterns": [],
    "scopeName": "inline.template-tagged-languages"
};

/**
 * @type {Grammar}
 */
const reinjectGrammarTemplate = 
{
    fileTypes: [],
    injectionSelector: getReinjectGrammarInjectionSelector(),
    patterns: [
        {
            include: "source.powershell#template-substitution-element"
        }
    ],
    scopeName: "inline.template-tagged-languages.reinjection"
};

/** 
 * @param {Language} language
 */
const getBasicGrammarPattern = (language) => 
{
    const sources = 
        Array.isArray(language.source) 
            ? language.source 
            : [ language.source ];

    return {
        name: raw`string.powershell.taggedTemplate.commentTaggedTemplate.${language.name}`,
        contentName: `meta.embedded.block.${language.name}`,

        /** 
         * Pattern notes:
         *   - Leading `<` of opening `<#` was consumed by outer rule.
         *   - Quotation char is captured in beginning group #3, and referenced in end to close.
         */
        begin: raw`(?i)([#]\s*\b(?:${language.identifiers.map(escapeRegExpForRaw).join('|')})\b\s*[#][>])\s*([@](['"])(?=\s*$))`,
        beginCaptures: {
            1: { name: 'comment.block.powershell' },
            2: { name: 'punctuation.definition.string.template.begin.powershell' }
        },
        end: raw`(?=^\3[@])`,
        patterns: [
            ...sources.map((source) => ({ 'include': source })),
            /**
             * When a language grammar is not installed, insert a phony pattern so that we still
             * match all the inner text but don't highlight it
             */
            {
                match: "."
            }
        ]
    };
};

/**
 * @return {Grammar}
 */
const getBasicGrammar = () => 
{
    const basicGrammar = basicGrammarTemplate;

    basicGrammar.repository = languages.reduce((repository, language) => 
    {
        repository[getRepositoryName(language)] = getBasicGrammarPattern(language);
        return repository;
    }, {});

    const allLanguageIdentifiers = [].concat(...languages.map(x => x.identifiers));
    basicGrammar.patterns = [
        {
            // Match entire language comment identifier but only consume block `<`
            begin: raw`(?i)([<])(?=([#]\s*\b(?:${allLanguageIdentifiers.map(escapeRegExpForRaw).join('|')})\b\s*[#][>])[\s]*[@](['"])[\s]*(?=$))`,
            beginCaptures: {
                1: { name: 'comment.block.powershell' }
            },
            end: raw`^(\3[@])`,
            endCaptures: {
                0: { name: 'string.quoted.heredoc.powershell' },
                1: { name: 'punctuation.definition.string.template.end.powershell' }
            },
            patterns: languages.map(language => ({ include: '#' + getRepositoryName(language) }))
        }

        /**
         * @TODO
         *  Unified pattern works but rigid scoping only handles single quote here-strings properly
         *  Either handle both cases with alternate captures, or just move back to definition in 
         *  `Multipattern Definition` region where @" and @' are handled separately 
         * 
         * @TODO (old)
         *  If possible unify into a single pattern for either quote type, and match end based on 
         *  previous capture group (again, if in scope to reference and therefore possible)
         */

        //#region Multipattern Definition
        

        // /**
        //  * Pattern for @' ... '@ Style Here-Strings
        //  */
        // {
        //     // Match entire language comment identifier but only consume block `<`
        //     begin: `(?i)([<])(?=([#]\\s*\\b(?:${allLanguageIdentifiers.map(escapeRegExp).join('|')})\\b\\s*[#][>])[\\s]*[@]['][\\s]*(?=$))`,
        //     beginCaptures: {
        //         1: { name: 'comment.block.powershell' }
        //     },
        //     end: `^(['][@])`,
        //     endCaptures: {
        //         0: { name: 'string.powershell' },
        //         1: { name: 'punctuation.definition.string.template.end.powershell' }
        //     },
        //     patterns: languages.map(language => ({ include: '#' + getRepositoryName(language) }))
        // },
        // /**
        //  * Pattern for @" ... "@ Style Here-Strings
        //  * 
        //  * These will be funky due to expansion, unfortunately
        //  */
        // {
        //     // Match entire language comment identifier but only consume block `<`
        //     begin: `(?i)([<])(?=([#]\\s*\\b(?:${allLanguageIdentifiers.map(escapeRegExp).join('|')})\\b\\s*[#][>])[\\s]*[@]["][\\s]*(?=$))`,
        //     beginCaptures: {
        //         1: { name: 'comment.block.powershell' }
        //     },
        //     end: `^(["][@])`,
        //     endCaptures: {
        //         0: { name: 'string.powershell' },
        //         1: { name: 'punctuation.definition.string.template.end.powershell' }
        //     },
        //     patterns: languages.map(language => ({ include: '#' + getRepositoryName(language) }))
        // },
        
        //#endregion Multipattern Definition
    ];

    inspectGrammarPatterns(basicGrammar, 'getBasicGrammar')

    return basicGrammar;
};

/**
 * @param {Language} language
 */
function getRepositoryName(language) 
{
    return 'commentTaggedTemplate-' + language.name;
}

/**
 * @return {string}
 */
function getBasicGrammarInjectionSelector() 
{
    return targetScopes
        .map(scope => `L:${scope} -comment -(string - meta.embedded)`)
        .join(', ');
}

/**
 * @return {string}
 */
function getReinjectGrammarInjectionSelector() 
{
    return targetScopes
        .map(scope => {
            const embeddedScopeSelectors = languages.map(language => `meta.embedded.block.${language.name}`);
            return `L:${scope} (${embeddedScopeSelectors.join(', ')})`
        })
        .join(', ');
}

/**
 * @param  {string} text
 * @return {string}
 */
function escapeRegExp(text) 
{
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Modified form of `escapeRegExp` for use with `raw` tagged template strings
 * @param  {string} text
 * @return {string}
 */
function escapeRegExpForRaw(text) 
{
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * @param {fs.PathLike} outFile
 * @param {{ fileTypes: any[]; injectionSelector: string; patterns: any[] | { include: string; }[]; scopeName: string; }} json
 */
function writeJson(outFile, json) 
{
    fs.writeFileSync(outFile, JSON.stringify(json, null, 4));
}

/**
 * just bc
 * 
 * @param {Grammar} grammar 
 * @param {string}  [context='']
 */
function inspectGrammarPatterns(grammar, context = '')
{
    if(context)
        console.log(`${c.blue.bold`[${context}]`} Grammar:`);

    ((/** @type {Pattern[]} */...itemsToInspect) => 
    {
        itemsToInspect.forEach((toInspect, idx) =>
        {
            console.log(`${context ? "    " : "" }Created Pattern ${c.red`#${idx}`}:`);

            const filtered = Object.fromEntries(
                Object.entries(toInspect).filter(([k, v]) => k !== 'patterns') );

            console.dir(filtered, {breakLength: 90, depth: 4, sorted: true})
        })

    })(...(grammar.patterns || []))
}

exports.updateGrammars = () => 
{
    const outDir = path.join(__dirname, '..', 'syntaxes');

    writeJson(path.join(outDir, 'grammar.json'), getBasicGrammar());
    writeJson(path.join(outDir, 'reinject-grammar.json'), reinjectGrammarTemplate);
};

