import prompts from 'prompts'
import { $ } from 'zx'
;(async () => {
  const config = await import('../configs/restful-react.config.js')
  const services = Object.keys(config.default)

  services.sort()

  const response = await prompts({
    type: 'multiselect',
    name: 'services',
    message: 'Please select the services you want to generate',
    choices: services.map(title => ({ title }))
  })

  if (!response.services || response.services.length === 0) {
    console.log('No services selected. Exiting...')
    process.exit(0)
  }

  for (const index of response.services) {
    const service = services[index]
    const { output } = config.default[service]
    await $`npx restful-react import --config configs/restful-react.config.js ${service}`
    await $`npx prettier --write ${output}`
  }
})()
