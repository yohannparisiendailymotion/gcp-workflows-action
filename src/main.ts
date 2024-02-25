import * as core from '@actions/core'

type FunctionSpecs = {
  name: string
  type: 'node' | 'python'
  folder: string
  runtime: string
  region: string
  entry_point: string
  env_name: string
  env_vars?: string
  commit: string
}

type Variable = {
  name: string
  value: string | number
}

type WorkflowSpecs = {
  functions: FunctionSpecs[]
  variables: Variable[]
  directory: string
  env: string
}

type GCFJobParams = {
  working_dir: string
  commit: string
  cmd_gcf: string
}

type WFJobParams = {
  working_dir: string
  env: string
  gcf_jobs: GCFJobParams[]
  variables: string
}

const gcfCommandPattern =
  'gcloud functions deploy @@name@@ --gen2 --project=dailymotion-ads-@@env@@ --region=@@region@@ --runtime=@@runtime@@ --source=./dist --trigger-http --entry-point=@@entry_point@@'
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const specs: string = core.getInput('specs')
    const env: string = core.getInput('env')
    const specsObj: WorkflowSpecs = JSON.parse(specs)
    let variables: string[] = []
    let jobs: GCFJobParams[] = []

    specsObj.functions.forEach(fn => {
      const wfWorkingDir = `${fn.type}/${fn.folder}`

      //Generate gcloud function deploy command
      let commandGcf = gcfCommandPattern
      commandGcf = commandGcf.replace('@@name@@', fn.name)
      commandGcf = commandGcf.replace('@@env@@', env)
      commandGcf = commandGcf.replace('@@region@@', fn.region)
      commandGcf = commandGcf.replace('@@runtime@@', fn.runtime)
      commandGcf = commandGcf.replace('@@entry_point@@', fn.entry_point)

      if (fn.env_vars) {
        commandGcf += `--set-env-vars=${fn.env_vars}`
      }

      const gcfJob: GCFJobParams = {
        cmd_gcf: commandGcf,
        working_dir: wfWorkingDir,
        commit: fn.commit
      }

      variables.push(
        `${fn.env_name}=https://${fn.region}-dailymotion-ads-${specsObj.env}.cloudfunctions.net/${fn.name}`
      )
      jobs.push(gcfJob)
    })

    const wfJob: WFJobParams = {
      working_dir: specsObj.directory,
      env: specsObj.env,
      gcf_jobs: jobs,
      variables: variables.join(',')
    }
    // Set outputs for other workflow steps to use
    core.setOutput('commands', JSON.stringify(wfJob))
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
