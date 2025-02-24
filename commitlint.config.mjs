/* eslint-disable no-useless-escape */
/* eslint-disable import/no-anonymous-default-export */

export default {
    parserPreset: {
        parserOpts: {
            headerPattern: /^(feat|fix|docs|style|refactor|perf|test|chore)\(([\w-]+)\):(.*)$/,
            headerCorrespondence: ['type', 'scope', 'description'],
            bodyPattern: /^(?:where: [^\n]+\nwhy: [^\n]+\ntesting_done: (?:yes|no)\nlinter_done: (?:yes|no))$/,
            bodyCorrespondence: ['body']
        },
    },
    plugins: [
        {
            rules: {
                'type-empty': parsed => {
                    const { type } = parsed;
                    if (!type) return [false, 'Type must not be empty'];
                    return [true, ''];
                },
                'type-enum': (parsed, _when, expectedValues) => {
                    const { type } = parsed;
                    if (!expectedValues.includes(type))
                        return [false, `Type must be one of: ${expectedValues.join(', ')}`];
                    return [true, ''];
                },
                'scope-empty': parsed => {
                    const { scope } = parsed;
                    if (!scope) return [false, 'Scope must not be empty'];
                    return [true, ''];
                },
                'description-empty': parsed => {
                    const { description } = parsed;
                    if (!description) return [false, 'Description must not be empty'];
                    return [true, ''];
                },
                'description-min-length': (parsed, _when, minLength) => {
                    const { description } = parsed;
                    if (description.length < minLength)
                        return [false, `Description must be at least ${minLength} characters long`];
                    return [true, ''];
                },
                'body-min-length': (parsed, _when, minLength) => {
                    const { body } = parsed;
                    if (!body || body.length < minLength)
                        return [false, `Body must be at least ${minLength} characters long`];
                    return [true, ''];
                },
                'testing-done-enum': parsed => {
                    const { body } = parsed;
                    const testing_done = /^testing_done:\s*(yes|no)$/.exec(body)?.[1];
                    if (!['yes', 'no'].includes(testing_done))
                        return [false, 'testing_done must be either "yes" or "no"'];
                    return [true, ''];
                },
                'linter-done-enum': parsed => {
                    const { body } = parsed;
                    const linter_done = /^linter_done:\s*(yes|no)$/.exec(body)?.[1];
                    if (!['yes', 'no'].includes(linter_done))
                        return [false, 'linter_done must be either "yes" or "no"'];
                    return [true, ''];
                }
            },
        },
    ],
    rules: {
        'type-empty': [2, 'never'],
        'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore']],
        'scope-empty': [2, 'never'],
        'description-empty': [2, 'never'],
        'description-min-length': [2, 'always', 10],
        'body-min-length': [2, 'always', 20],
        'testing-done-enum': [2, 'always'],
        'linter-done-enum': [2, 'always'],
    },
};
