import ndarray from 'ndarray';
import { TrasnformAlgorithm } from './stego';

interface CanvasProps {
  width: number;
  height: number;
  res: number[][];
  ims: number[][];
  algorithm: TrasnformAlgorithm;
}
