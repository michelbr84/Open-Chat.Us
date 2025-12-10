import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash, Send } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
    onAudioRecorded: (file: File) => void;
    disabled?: boolean;
}

export const AudioRecorder = ({ onAudioRecorded, disabled }: AudioRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            toast({
                title: "Microphone Error",
                description: "Could not access microphone. Please check permissions.",
                variant: "destructive"
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        stopRecording();
        setAudioBlob(null);
        setRecordingTime(0);
    };

    const playRecording = () => {
        if (!audioBlob) return;

        if (!audioRef.current) {
            const url = URL.createObjectURL(audioBlob);
            audioRef.current = new Audio(url);
            audioRef.current.onended = () => setIsPlaying(false);
        }

        audioRef.current.play();
        setIsPlaying(true);
    };

    const pauseRecording = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const sendRecording = () => {
        if (!audioBlob) return;

        const file = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
        onAudioRecorded(file);
        setAudioBlob(null);
        setRecordingTime(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (audioBlob) {
        return (
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg animate-in fade-in slide-in-from-bottom-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={isPlaying ? pauseRecording : playRecording}
                    className="h-8 w-8 p-0"
                >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-xs font-mono">{formatTime(recordingTime)}</span>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelRecording}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                    <Trash className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    onClick={sendRecording}
                    className="h-8 px-3"
                >
                    <Send className="h-3 w-3 mr-2" />
                    Send
                </Button>
            </div>
        );
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 transition-all duration-300 ${isRecording ? 'bg-destructive/10 text-destructive animate-pulse' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            title={isRecording ? "Stop recording" : "Record voice message"}
        >
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
    );
};
