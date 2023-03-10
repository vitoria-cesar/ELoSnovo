import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GridMapHelper } from '../../helpers/GridMapHelper'
import 
{
    degreeToRadians,
    resizeCanvasToDisplaySize,
    rotateActorLeft,
    rotateActorRight,
    sceneProperties, 
    translateActorBackward, 
    translateActorFoward,
    printOnConsole,
    loadGLBFile,
    loadOBJFile,
    rotateActorUTurn
} from '../../helpers/Util'
import Fire from '../../helpers/FireObject/Fire'
import {editor,readOnlyState} from '../../components/global/editor'
import { parseCode } from '../../level2/level2Parser'
import { CSG } from '../../helpers/CSGMesh'

const scene = new THREE.Scene()

let extinguisherUses = 1

const camera = new THREE.PerspectiveCamera(45, 2, 1, 1000)
camera.position.set(0,15,30)

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("sceneView")})

window.addEventListener( 'resize', function(){
    resizeCanvasToDisplaySize(renderer,camera);
}, false );

const ambientLight = new THREE.HemisphereLight('white','darkslategrey',0.5)

const mainLight = new THREE.DirectionalLight('white',0.7)
mainLight.position.set(2,1,1)

const controls = new OrbitControls(camera, renderer.domElement)

const gridMapHelper = new GridMapHelper()

const plane = gridMapHelper.createGridPlane()

var actorModelPath = new URL('../../../assets/models/eve.glb',import.meta.url).toString()
const actor = new THREE.Object3D()
loadGLBFile(actor,actorModelPath,"eve",2.0)
actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5))
actor.rotateY(degreeToRadians(90))

const objective = new THREE.Object3D()
var crystalModelPath = new URL('../../../assets/models/crystal.obj',import.meta.url).toString()
var crystalTexturePath = new URL('../../../assets/textures/crystal.jpg',import.meta.url).toString()
loadOBJFile(objective,crystalModelPath,'crystal',crystalTexturePath,2.0)
objective.rotateX(degreeToRadians(-90))
objective.position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.0,gridMapHelper.getGlobalZPositionFromCoord(5))

const boxGeometry = new THREE.BoxGeometry(18,2,2)
const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"})
const box1 = new THREE.Mesh(boxGeometry,boxMaterial)
const box2 = new THREE.Mesh(boxGeometry,boxMaterial)
box1.position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(4))
box2.position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(6))
gridMapHelper.addObstacle(1,9,4,4)
gridMapHelper.addObstacle(1,9,6,6)

const fireClock = new THREE.Clock()
const fireTexPath = new URL('../../../assets/textures/fire.png',import.meta.url).toString()
const fireTex = new THREE.TextureLoader().load(fireTexPath)
const fireHole = new Fire(fireTex)
fireHole.scale.set(1.2, 3.0, 1.2)
fireHole.position.set(gridMapHelper.getGlobalXPositionFromCoord(7),1.5,gridMapHelper.getGlobalZPositionFromCoord(5))
gridMapHelper.addFireHole(7,5)

const cylinderMesh1 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32))
const cylinderMesh2 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1, 32))

cylinderMesh2.position.set(gridMapHelper.getGlobalXPositionFromCoord(4.5),0.25,gridMapHelper.getGlobalZPositionFromCoord(4.5))
cylinderMesh2.matrixAutoUpdate = false
cylinderMesh2.updateMatrix()

const cylinderCSG1 = CSG.fromMesh(cylinderMesh1)
const cylinderCSG2 = CSG.fromMesh(cylinderMesh2)

const cylindersSubtractCSG = cylinderCSG1.subtract(cylinderCSG2)
const cylindersSubtractMesh = CSG.toMesh(cylindersSubtractCSG, new THREE.Matrix4())

const cylinderTexPath = new URL('../../../assets/textures/tijolo 4.avif',import.meta.url).toString()
const cylinderTex = new THREE.TextureLoader().load(cylinderTexPath)

cylindersSubtractMesh.material.map = cylinderTex
cylindersSubtractMesh.position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.5,gridMapHelper.getGlobalZPositionFromCoord(5))

const cylinderMesh3 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.7, 1.1, 64))
const cylinderMesh4 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.7, 64))

cylinderMesh4.position.set(gridMapHelper.getGlobalXPositionFromCoord(4.5),0.25,gridMapHelper.getGlobalZPositionFromCoord(4.5))
cylinderMesh4.matrixAutoUpdate = false
cylinderMesh4.updateMatrix()

const cylinderCSG3 = CSG.fromMesh(cylinderMesh3)
const cylinderCSG4 = CSG.fromMesh(cylinderMesh4)

const cylindersSubtractCSG1 = cylinderCSG3.subtract(cylinderCSG4)
const cylindersSubtractMesh1 = CSG.toMesh(cylindersSubtractCSG1, new THREE.Matrix4())
cylindersSubtractMesh1.material = new THREE.MeshPhongMaterial({color: 'black'})
cylindersSubtractMesh1.position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.5,gridMapHelper.getGlobalZPositionFromCoord(5))

scene.add(ambientLight)
scene.add(mainLight)
scene.add(plane)
scene.add(objective)
scene.add(actor)
scene.add(box1)
scene.add(box2)
scene.add(fireHole)
scene.add(cylindersSubtractMesh)
scene.add(cylindersSubtractMesh1)

function animate() {
    requestAnimationFrame(animate)
    fireHole.update(fireClock)
    controls.update()
    renderer.render(scene, camera)
}

async function andarFrente(amount)
{
    await translateActorFoward(actor,amount,gridMapHelper,sceneProperties)
}

async function andarTras(amount)
{
    await translateActorBackward(actor,amount,gridMapHelper,sceneProperties)
}

async function girarDireita()
{
    await rotateActorRight(actor,sceneProperties)
}

async function girarEsquerda()
{
    await rotateActorLeft(actor,sceneProperties)
}

async function darMeiaVolta()
{
    await rotateActorUTurn(actor,sceneProperties)
}

function pegandoFogo()
{
    if(gridMapHelper.detectHole(actor.position) != null)
    {
        return true
    }
    else
    {
        return false
    }
}

function updateExtinguisherUses()
{
    const usesElement = document.getElementById("extinguisherUses")
    usesElement.innerText = `x${extinguisherUses}`
}

function apagarFogoECobrirBuraco()
{
    if(extinguisherUses > 0)
    {
        if(gridMapHelper.deactivateHole(actor.position,'fire'))
        {
            fireHole.visible = false
            extinguisherUses--
            updateExtinguisherUses()
        }
    }
    else
    {
        printOnConsole("Estou sem extintores!")
    }
}

function checkCollision(object1,object2)
{
    if(gridMapHelper.getXCoordFromGlobalPosition(object1.position.x) == gridMapHelper.getXCoordFromGlobalPosition(object2.position.x) && gridMapHelper.getZCoordFromGlobalPosition(object1.position.z) == gridMapHelper.getZCoordFromGlobalPosition(object2.position.z))
    {
        return true
    }
    else
    {
        return false
    }
}

function coletarCristal()
{
    if(sceneProperties.cancelExecution)
    {
        return
    }

    if(checkCollision(actor,objective))
    {
        objective.visible = false
        printOnConsole("Cristal coletado com sucesso.")
    }
    else
    {
        printOnConsole("Rob?? n??o est?? sobre o cristal.")
    }
}

function resetLevel()
{
    extinguisherUses = 1
    updateExtinguisherUses()
    actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5))
    actor.rotation.set(0,degreeToRadians(90),0)
    actor.getObjectByName('eve').rotation.set(0,0,0)
    gridMapHelper.restartHoles()
    fireHole.visible = true
    objective.visible = true
}

function winCondition()
{
    if(checkCollision(actor,objective) && !objective.visible)
    {
        return true
    }
    else
    {
        return false
    }
}

const execBtn = document.getElementById("execute")
execBtn.addEventListener("click",async function(){
    let codeParsed = parseCode(editor.state.doc.toString(),10)
    sceneProperties.cancelExecution = false
    if(codeParsed != null)
    {
        resetLevel()
        document.getElementById("execute").disabled = true
        await eval(codeParsed)
        if(winCondition())
        {
            readOnlyState.doc = editor.state.doc
            editor.setState(readOnlyState)
            document.getElementById('winMessage').classList.remove('invisible')
            document.getElementById('advanceBtn').classList.remove('invisible')
            document.getElementById("reset").disabled = true
        }
        else
        {
            document.getElementById("execute").disabled = false
        }
    }
})

const resetBtn = document.getElementById("reset")
resetBtn.addEventListener("click",function(){
    sceneProperties.cancelExecution = true
    resetLevel()
})

const clsConsoleBtn = document.getElementById("clsConsole")
clsConsoleBtn.addEventListener("click",function(){
    document.getElementById("console-printing").innerHTML = null
})

resizeCanvasToDisplaySize(renderer,camera)
updateExtinguisherUses()
animate()