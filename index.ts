import ContentfulExport from './contentful-export.json'

let output = ''

type Field = (typeof ContentfulExport)['contentTypes'][number]['fields'][number]

function createFieldValue(field: Field): string {
  switch (field.type) {
    case 'Symbol':
    case 'Text':
    case 'Date':
      return 'string'
    case 'Boolean':
      return 'boolean'
    case 'Link':
      return `{
      sys: {
        type: 'Link',
        linkType: 'Entry',
        id: string
      }
    }`
    case 'Array':
      const childType = createFieldValue(field.items as any)
      return `Array<${childType}>`
    default:
      throw new Error(`Unknown type: ${field.type}`)
  }
}

ContentfulExport.contentTypes.map((c) => {
  output += `export type I${c.sys.id} = {\n`
  for (const field of c.fields) {
    output += `  ${field.id}?: {\n`
    output += `    'en-US': `
    output += createFieldValue(field)
    output += '\n'
    output += `  }\n`
  }
  output += `}\n\n`
})

await Bun.write('contentful-types.ts', output)

console.log('✓ output to scripts/shared/contentful-types.ts')
